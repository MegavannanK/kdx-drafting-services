# KDX Drafting Services

A responsive Next.js website with a procedural Three.js steel structure and ten project models embedded through Trimble Connect.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js (normally http://localhost:3000).

## Production

```sh
npm run build
```

The site is configured as a static export. Deploy the generated `out/` directory to a static web host. `next start` does not serve a static export; use a static server for production preview.

## Main files

- `src/app/page.tsx`: page content, project filters, navigation, enquiry flow.
- `src/app/globals.css`: design system and responsive styles.
- `src/components/steel-scene.tsx`: Three.js structure, orbit controls, wireframe and exploded modes, responsive camera, WebGL fallback.
- `src/components/project-viewer.tsx`: accessible modal with the official Trimble viewer, reload, full screen, and direct-open fallback.
- `src/lib/projects.ts`: supplied project names and share tokens.
- `src/lib/model-metadata.json`: project/model IDs resolved from the supplied share links.

## Scroll-driven process story

The pinned `ScrollJourney` section uses native page scrolling to control a Three.js sequence: a plan lifts into a portal frame, the steel members assemble, a bolted connection slides into close-up, and the complete structure returns for delivery. Scrolling backwards reverses the sequence. Chapter buttons provide direct navigation, with a Skip link to leave the sequence.

Rendering is lazy-loaded and pauses out of view. Reduced-motion preferences replace the long pinned scroll with selectable chapters and immediate state changes. The scene is an illustrative process study, separate from the original Trimble project models.

Edit `src/components/scroll-journey.tsx` for chapter copy and timing, `scroll-journey-scene.tsx` for geometry and camera motion, and `scroll-journey.css` for layout.

## Project models

Each supplied share link has been resolved to its Trimble project and model ID. The viewer uses Trimble's documented `stoken` query parameter to load the original model. Only one external viewer is mounted at a time, after the visitor selects a project.

Model access depends on the share link's validity, permissions, Trimble availability, and browser support. A page or iframe load event does not prove that the model loaded. The interface keeps Reload and Open in Trimble available. No private OAuth credentials are included.

To update metadata after replacing links, run `node scripts/resolve-models.mjs` with network access. Review category assignments before a public launch; they were inferred from the supplied project names.

The homepage steel frame and connection drawings are clearly labelled illustrations. They are not replicas of the supplied project models or construction documents.

## Enquiries

The validated enquiry form prepares a `mailto:` message to the company's published address. The visitor reviews, attaches drawings, and sends it in their email application. There is no contact database or email delivery backend.

## Content and references

Company services, contact details, and published experience figures: https://www.kdxdraftingservices.com/

Visual direction reference: https://terafab.ai/

Trimble embed documentation: https://components.connect.trimble.com/trimble-connect-workspace-api/index.html

Fonts are loaded from Google Fonts, with local system fallbacks. Reduced-motion preferences disable automatic scene rotation and decorative animations. The model renderer pauses when outside the viewport.
