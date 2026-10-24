# Design and asset notes

The website takes its cinematic architectural hero, serif typography and spacious editorial rhythm from the CKPC reference supplied by the user. The earlier KDX site supplies the original project imagery and the precedent for the interactive scroll-driven experience.

Brand assets are original files copied from the supplied Blue folder: `kdx logo.png` for the horizontal logo and `Recovered_KDX LOGO.png` for the emblem. A favicon is resized from the same original emblem.

The hero is an illustrative architectural concept, generated using the built-in image-generation tool. Final website asset: `public/images/architecture-hero.jpg`. It is not presented as completed KDX work.

## Final generation prompt

Photorealistic architectural visualization of a three-storey contemporary Australian pavilion with an expressed steel frame, glazed facades, stone slabs, oak fins, landscaped balconies and a reflection pool at blue hour; wide cinematic composition; no text or logos.

## Project provenance

The seven archive images were already in the supplied repository and match the earlier KDX website. The covered walkway model is reconstructed from `public/images/projects/project-03.jpg`, with approximate dimensions. The architectural canopy treatment, glazing and timber-toned deck are explicitly presented as a design exploration. No unverified named project or client is associated with the model.

## Homepage video

The hero uses the 19-second “Central business district” architectural pan from Mixkit, self-hosted at `public/videos/architecture-hero.mp4`, with its matching poster at `public/images/architecture-video-poster.jpg`. This is mood footage, not a completed KDX project. The original generated architectural image remains in the services section.

Source: https://mixkit.co/free-stock-video/central-business-district-4168/
License: Mixkit Stock Video Free License, commercial and personal use, https://mixkit.co/license/#videoFree (checked 12 October 2026).

The muted film loops inline, offers a keyboard-accessible pause/play control, and pauses offscreen or in a hidden tab. Reduced-motion and data-saving preferences show the poster without automatically loading the video; visitors can opt in with Play film. Media errors keep the poster visible. All media paths support the configured deployment base path.

## October 2026 redesign — two services

### Versions reviewed

- Current live GitHub Pages site: the architecture/interiors/structures version from `64e9bc6`, published as `59ad5f7`. Inspected in the browser.
- Earlier deployed steel-led site: static deployment `bf560a6`, corresponding source history through `865a1ba` / `fef39a1`. Reviewed its source, deployment HTML and retained desktop/mobile verification images.
- The legacy Sites project ID in `.openai/hosting.json` returned “project not found”; the working deployment is GitHub Pages. This redesign remains in the local checkout for review and does not change production hosting.

### Design decisions

Retain the supplied blue KDX logo and the earlier version’s clear explanation of steel detailing. Replace the stock city video and blended architecture/interiors positioning with an ivory-and-blue drafting studio identity. A modest residential cutaway introduces the scale of everyday homes. Steel and architectural services have distinct selectors, deliverables and enquiry paths. Actual project imagery is prioritised over invented finished-building photography.

The pinned structural process returns from the earlier site, now restyled to fit the blue brand. It remains explicitly illustrative. Chapter buttons provide direct access; reduced-motion and short-screen visitors use manual stages.

### Verified project captures

All ten named images were captured directly from the corresponding client-supplied Trimble model on 19 October 2026. Model filenames were checked in the viewer before capture. Crops contain the model canvas, not external navigation or share URLs. Images have not been generated, relabelled from unrelated archive pictures, or presented as finished-building photographs.

| Project | Local image |
| --- | --- |
| PRJ2652 — Weston Shed | `public/images/projects/weston-shed.jpg` |
| PRJ2635 — Foam Tank 600 | `public/images/projects/foam-tank.jpg` |
| PRJ2674 — Lot 12 Peats Ferry Road | `public/images/projects/peats-ferry.jpg` |
| PRJ2678 — 1001 Grandview Road | `public/images/projects/grandview-road.jpg` |
| PRJ2644 — 21 Godfrey Street | `public/images/projects/godfrey-street.jpg` |
| PRJ2655 — 438 Kline Street | `public/images/projects/kline-street.jpg` |
| PRJ2629 — Little Street, Mosman | `public/images/projects/little-street.jpg` |
| PRJ2567 — 262 Burraneer Bay Road | `public/images/projects/burraneer-bay.jpg` |
| PRJ2689 — 3 George Street, Brunswick | `public/images/projects/george-street.jpg` |
| PRJ2669 — 4 Slade Avenue, Lindfield | `public/images/projects/slade-avenue.jpg` |

Portfolio categories retain the earlier repository’s residential/industrial classifications, with Weston grouped as sheds & commercial. The supplied brief confirms steel detailing and architectural drafting; detailed architectural deliverables are described without promising engineering design, certification, permit approval or registered-architect services.

### New concept asset

`public/images/residential-concept.jpg` was generated with the built-in image-generation tool, then saved as an optimised JPEG. It is used only as a labelled illustrative concept in the hero and architectural service panel, never as a named completed project.

Prompt: “Use case: stylized-concept. Asset type: architectural drafting studio website hero, landscape 3:2 image. Create an extremely refined architectural scale model visualization of a modest single-storey Australian courtyard house, three-quarter elevated axonometric view, complete isolated building with comfortable margin on all sides, on a seamless warm ivory background #eeeae2. House has simple pale offwhite brick walls, slim dark charcoal steel framing and roof edges, one warm oak-clad volume, glazing, small patio and low landscape grasses. Right portion finished with standing seam roof and beautiful facade; left portion roof lifted very slightly or omitted to reveal precise steel columns and beams and inside floor plan like a sophisticated architectural cutaway. Believable modest residential scale, not a mansion, not a skyscraper. Museum architectural maquette photographed with soft afternoon shadows, photoreal materials, exceptional tactile editorial quality, clean understated composition. No text, logos, annotations, people, dimensions or watermark. Entire house visible. This is an illustrative concept rather than a real client project.”

### Follow-up: restored stair-and-walkway story

A fresh `git fetch origin` confirmed that `origin/feature/enhancements` and `origin/main` both point to `64e9bc6`; `origin/feature/version1` is `fef39a1`; `origin/gh-pages` is `59ad5f7`, deployed from `64e9bc6`. No newer remote source branch was found.

The stair-and-walkway scene from the deployed enhancement version has been restored as the default 3D experience. A study selector retains the steel-frame/connection sequence as an alternative without putting two long pinned sections in the visitor’s path. The default sequence shows foundations, stairs/deck/rails, and an explicitly illustrative finished treatment. It retains the original archive reference image. Wheel zoom is disabled so the pinned story scrolls naturally; dragging is opt-in, with separate rotation, layer and reset controls. Reduced-motion preferences apply instant stage changes rather than animated assembly.


### Follow-up: cinematic ground-up construction opening

The static opening is now a custom real-time Three.js construction film. A compact single-storey courtyard home connects the steel and architectural disciplines at a residential scale. Two pitched-roof wings frame a sheltered courtyard, with pale masonry, charcoal standing-seam roofs, slender steel members, large glazed openings, timber decking and olive-inspired planting.

The 28-second sequence starts with plan lines and concrete foundations, erects the steel columns and roof frame, adds walls and glazing, closes the roof and completes the landscape. A continuous high-angle camera move presents the changing structure. Four chapter buttons seek to deterministic positions, with pause, play and replay. Playback holds the finished composition, pauses offscreen/in a background tab and uses demand rendering when stopped. Reduced-motion visitors see the finished model without autoplay. The original illustrative image remains as the loading/WebGL fallback and architectural service illustration.

This is a stylised architectural model rendered live in the browser, not a photorealistic MP4 or a reconstruction of any named client project. The construction choreography communicates drafting scope; it is not a certified construction methodology. The actual project portfolio and the pinned stair-and-walkway story remain separate. No additional stock footage or externally hosted model assets were introduced.
