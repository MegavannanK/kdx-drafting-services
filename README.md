# KDX — Steel Detailing & Architectural Drafting

A responsive Next.js landing page for two distinct drafting services, with a cinematic 3D construction hero, verified project imagery and a scroll-driven Three.js detailing story.

## Local development

```sh
npm ci
npm run dev -- --port 3000
```

The enquiry form prepares a draft in the visitor’s email application. It does not send mail or store form submissions.

## Validation and static export

```sh
npm run typecheck
npm run build
```

The build exports to `out/`. For the existing GitHub Pages deployment:

```sh
NEXT_PUBLIC_BASE_PATH=/kdx-drafting-services npm run build
```

## Experience

- A 28-second real-time Three.js opening follows a courtyard home from foundation lines through the steel frame, walls, glazing, roof and landscaping. A slow high-angle camera move finishes on the completed concept. Pause, replay and four chapter shortcuts are available.
- The film plays once, stops offscreen or in a hidden tab, and holds the finished view. Reduced-motion users start with the finished model. A static concept image remains available during loading or without WebGL. This is a custom illustrative model, not footage of a completed client project.

- Two service selectors: **Steel detailing** and **Architectural drafting**, each with its own deliverables, imagery and enquiry shortcut.
- Real captures of all ten client-supplied project models. Portfolio filters, an expandable gallery and accessible image dialogs keep visitors on the website.
- The default pinned 3D study restores the stair-and-walkway experience from the deployed enhancement branch, with Structure, Connect and Experience stages. A second selectable study retains the four-stage steel-frame and connection story. Only the selected study is mounted.
- The walkway is an approximate reconstruction from archive image 03; the canopy and finishes are explicitly illustrative. The steel-frame study is representative, not a reconstruction of Weston Shed.
- Layer separation, optional dragging, rotation and reset controls are available in the walkway study. Wheel scrolling advances the page and never zooms the model.
- Reduced-motion preferences and short viewports use manually selected stages. A static illustration is available without WebGL, and the render loop pauses outside the section.
- Mobile navigation, keyboard dismissal of menus/dialogs, native form validation, and base-path-safe assets.

## Main files

- `src/app/page.tsx`: navigation, service content, portfolio, studio and enquiry form.
- `src/app/globals.css`: responsive visual system.
- `src/components/construction-hero.tsx` and `.css`: cinematic opening layout, playback, chapter navigation and motion preferences.
- `src/components/construction-scene.tsx`: procedural courtyard home, construction choreography, materials, lighting and high-angle camera.
- `src/lib/portfolio.ts`: public project metadata and matching local image filenames; contains no external share links.
- `src/components/detail-explorer.tsx`: selects between the stair/walkway study and the steel-frame study.
- `src/components/project-showcase.tsx` and `walkway-scene.tsx`: restored stair/walkway sequence, controls and Three.js model.
- `src/components/scroll-journey.tsx`: steel-story scroll progression and accessible chapter controls.
- `src/components/scroll-journey-scene.tsx`: Three.js steel structure and connection animation.
- `public/images/projects/`: original archive images and verified named project captures.
- `public/images/residential-concept.jpg`: generated residential cutaway, explicitly labelled illustrative.

Older unused scene, video and viewer components remain in the repository but are not mounted on the homepage. See `design-notes.md` for the version review and asset provenance.
