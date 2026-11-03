// Renders each project's Trimble Connect model in headless Chrome and saves
// high-definition stills for the site. Two stages so either can be re-run:
//
//   node scripts/capture-models.mjs render [PRJ2652 ...]   -> .captures/raw/*.png
//   node scripts/capture-models.mjs process                 -> public/images/projects/hd/*.webp
//
// Render: opens the public share (stoken) embed, strips the viewer chrome, makes
// the WebGL canvas fill a 1600x1000 viewport at 2x, then grabs a 3200x2000 frame
// of the model's default (fitted) view.
// Process: flattens the viewer's grey gradient to pure white (each pixel divided
// by the background estimated for its row), crops to the model, writes WebP.
// Needs Playwright + system Chrome (dev-only; nothing here ships to the site).
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url);
const RAW = new URL('.captures/raw/', ROOT);
const OUT = new URL('public/images/projects/hd/', ROOT);
// The axis gizmo is drawn inside the canvas, bottom-right; it is painted out.
const GIZMO = { w: 260, h: 300 }; // device px at 2x

const source = await readFile(new URL('src/lib/projects.ts', ROOT), 'utf8');
const meta = JSON.parse(await readFile(new URL('src/lib/model-metadata.json', ROOT), 'utf8'));
const portfolio = await readFile(new URL('src/lib/portfolio.ts', ROOT), 'utf8');
const slugOf = Object.fromEntries([...portfolio.matchAll(/id: '([^']+)'.*?image: '([^']+)'/g)].map(m => [m[1], m[2]]));
const projects = [...source.matchAll(/id: '([^']+)'.*?token: '([^']+)'/g)]
  .map(([, id, token]) => ({ id, token, slug: slugOf[id], ...meta[id] }))
  .filter(p => p.slug && p.projectId);

const [stage = 'render', ...only] = process.argv.slice(2);
const selected = only.length ? projects.filter(p => only.includes(p.id)) : projects;

async function render() {
  await mkdir(RAW, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const project of selected) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
    const url = `https://web.connect.trimble.com/projects/${project.projectId}/viewer/3d/?embed=true&modelId=${project.modelId}&origin=app32.connect.trimble.com&stoken=${encodeURIComponent(project.token)}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForFunction(() => document.querySelector('web3d-viewer')?.shadowRoot?.querySelector('canvas'), null, { timeout: 90000 });
      await page.waitForTimeout(16000); // geometry streams in after the canvas appears
      await page.evaluate(() => {
        document.querySelector('#onetrust-consent-sdk')?.remove();
        document.querySelector('header')?.remove();
        const viewer = document.querySelector('web3d-viewer');
        Object.assign(viewer.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '2147483647' });
        const style = document.createElement('style');
        style.textContent = 'main > :not(canvas){display:none!important}';
        viewer.shadowRoot.append(style);
        window.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(5000);
      const canvas = page.locator('web3d-viewer canvas');
      // Large models stream slowly: poll until the canvas shows geometry, then let it finish.
      for (let tries = 0; ; tries++) {
        const { channels } = await sharp(await canvas.screenshot()).stats();
        if (channels[0].stdev > 3) break;
        if (tries > 25) throw new Error('model never appeared');
        await page.waitForTimeout(3000);
      }
      await page.waitForTimeout(8000);
      await canvas.screenshot({ path: new URL(`${project.slug}.png`, RAW).pathname });
      console.log(`${project.id} ${project.slug}: rendered`);
    } catch (error) {
      console.log(`${project.id} ${project.slug}: ${error.message.split('\n')[0]}`);
    }
    await page.close();
  }
  await browser.close();
}

// Background of the viewer is a soft vertical gradient; estimate it per row
// from the left and right margins and divide it out.
async function flatten(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 3);
  const edge = Math.round(w * .012);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    const gizmoRow = y >= h - GIZMO.h;
    const bg = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let x = 0; x < edge; x++) sum += data[(y * w + x) * 3 + c]; // left margin (the gizmo sits on the right)
      bg[c] = sum / edge;
    }
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      if (gizmoRow && x >= w - GIZMO.w) { out.fill(255, i, i + 3); continue; }
      let ink = false;
      for (let c = 0; c < 3; c++) {
        const v = Math.min(255, Math.round(data[i + c] / bg[c] * 255));
        out[i + c] = v;
        if (v < 236) ink = true;
      }
      if (ink) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
  }
  return { out, w, h, box: { minX, minY, maxX, maxY } };
}

async function processAll() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(RAW)).filter(f => /^[a-z0-9-]+\.png$/.test(f));
  for (const f of files) {
    const slug = f.replace('.png', '');
    if (only.length && !selected.some(p => p.slug === slug)) continue;
    const { out, w, h, box } = await flatten(new URL(f, RAW).pathname);
    if (box.maxX <= box.minX) { console.log(`${slug}: no model in frame, skipped`); continue; }
    const pad = Math.round(Math.max(box.maxX - box.minX, box.maxY - box.minY) * .06);
    // Fixed 16:10 frame centred on the model, so every project sits the same way on the stage.
    let cw = box.maxX - box.minX + pad * 2, ch = box.maxY - box.minY + pad * 2;
    if (cw / ch > 1.6) ch = cw / 1.6; else cw = ch * 1.6;
    cw = Math.min(w, Math.round(cw)); ch = Math.min(h, Math.round(ch));
    const left = Math.max(0, Math.min(w - cw, Math.round((box.minX + box.maxX) / 2 - cw / 2)));
    const top = Math.max(0, Math.min(h - ch, Math.round((box.minY + box.maxY) / 2 - ch / 2)));
    const crop = sharp(out, { raw: { width: w, height: h, channels: 3 } }).extract({ left, top, width: cw, height: ch });
    await crop.clone().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 86, smartSubsample: true }).toFile(new URL(`${slug}.webp`, OUT).pathname);
    await crop.clone().resize({ width: 1200 }).webp({ quality: 82, smartSubsample: true }).toFile(new URL(`${slug}-sm.webp`, OUT).pathname);
    console.log(`${slug}: crop ${cw}x${ch}`);
  }
}

if (stage === 'render') await render();
else if (stage === 'process') await processAll();
else console.log('Usage: node scripts/capture-models.mjs render|process [PRJ…]');
