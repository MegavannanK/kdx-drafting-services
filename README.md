# KDX — Architecture, Interiors & Steel Structures

A responsive architectural website with the supplied blue KDX branding, cinematic architectural imagery, an interactive building concept, and a visual project showcase.

## Run locally

Requires Node.js 20.9 or newer. Dependencies are already installed in this checkout.

```sh
npm run dev -- --port 3000
```

Open http://localhost:3000. The enquiry form prepares a message in the visitor’s email application; the visitor reviews and sends it.

## Showcase

The website showcases work directly on the page. It does not expose the previous project share links or mount external project viewers.

- **Architecture explorer:** a locally rendered building concept with glazed facades, interiors, landscaping, steel-frame and cutaway views, and separated levels.
- **Featured project study:** a covered walkway reconstructed from original archive image 03. Scrolling reveals supports, connected deck and stairs, then a proposed architectural finish. Stage controls, layer separation, rotation and camera reset are included.
- **Project gallery:** all seven original archive images, with thumbnails and previous/next controls. Captions describe visible geometry; archive images are not assigned unverified client names or locations.
- **Location:** an embedded Google Map for Nowra, NSW 2541. This is the published locality, not an exact office pin.

The walkway is a visual reconstruction from the image, with approximate geometry. Its canopy, glazing and timber-toned finishes are design explorations rather than claims about the completed project. Both local 3D studies are labelled accordingly. WebGL fallbacks show imagery; reduced-motion preferences use selectable stages instead of pinned scrolling. Render loops pause out of view.

## Build and validation

```sh
npm run typecheck
npm run build
```

The production build is a static export in `out/`. For the existing GitHub Pages path:

```sh
NEXT_PUBLIC_BASE_PATH=/kdx-drafting-services npm run build
```

## Main files

- `src/app/page.tsx`: architectural content, navigation, services, maps and enquiry form.
- `src/app/globals.css`: overall visual system and responsive layouts.
- `src/components/steel-scene.tsx`: complete building concept and structure/cutaway views.
- `src/components/project-showcase.tsx`: project story, native scroll progression and archive gallery.
- `src/components/project-showcase.css`: showcase layouts and responsive styling.
- `src/components/walkway-scene.tsx`: project reconstruction, staged layers and 3D controls.
- `public/images/brand/`: original supplied blue logos.
- `public/images/architecture-hero.jpg`: generated illustrative architectural concept.

Legacy project-viewer components and metadata remain as unused source files. They are not imported by the current site.

See `design-notes.md` for the architectural image-generation brief and asset provenance.
