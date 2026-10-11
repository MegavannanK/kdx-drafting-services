import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/lib/projects.ts', import.meta.url), 'utf8');
const entries = [...source.matchAll(/id: '([^']+)'.*?token: '([^']+)'/g)];
const resolved = {};
await Promise.all(entries.map(async ([, id, token]) => {
  try {
    const response = await fetch(`https://app32.connect.trimble.com/tc/api/2.0/s/${token}`, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    const location = response.headers.get('location');
    const match = location?.match(/project\/([^/]+)\/detailviewer\/([^/]+)/);
    if (!match) throw new Error(`No model redirect (HTTP ${response.status})`);
    resolved[id] = { projectId: match[1], modelId: match[2] };
    console.log(`${id}: model link resolved`);
  } catch (error) { console.log(`${id}: ${error.message}`); }
}));
await writeFile(new URL('../src/lib/model-metadata.json', import.meta.url), JSON.stringify(resolved, null, 2) + '\n');
console.log(`Resolved ${Object.keys(resolved).length}/${entries.length} projects.`);
