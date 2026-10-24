# Redesign verification — 19 October 2026

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `NEXT_PUBLIC_BASE_PATH=/kdx-drafting-services npm run build`: passed.
- `git diff --check`: passed.
- Static export: 21 referenced base-path assets checked, none missing. All 10 named project images present. No hero video or external Trimble links in the rendered page.
- Browser: desktop 1280px, mobile 390px and sidebar 549px inspected. No horizontal overflow in tested desktop/mobile states; no broken loaded images or browser errors observed.
- Services: architectural selector replaces the content and illustration; accordion expansion works; service-specific enquiry link selects Architectural drafting in the form.
- Portfolio: Residential shows 8 projects after expansion; Industrial and Sheds & commercial each show 1; All projects expands to 10. Project image dialog opens, names the selected project, focuses its close button, and dismisses with Escape.
- Navigation: mobile menu opens and closes through destination links.
- Three.js: pinned Coordinate and Detail chapters render on mobile; chapter controls change the model/story, including the bolted connection view. Short-screen/manual-stage and reduced-motion code paths are present; OS reduced-motion emulation was not available in this browser test.
- Enquiry: empty submission focuses the required name field; required name, email, service and message remain invalid. No email was sent. The form retains its email-app draft workflow.

The built site is served locally at http://localhost:3001/kdx-drafting-services/ for review. Production has not been changed.

## Stair-and-walkway follow-up

- Fetched origin successfully. Latest remote source remains `64e9bc6` on main and feature/enhancements; gh-pages deployment is `59ad5f7`; feature/version1 is the older source.
- Rebuilt the static GitHub Pages export successfully after restoring the walkway.
- Desktop 1280px and mobile 390px: walkway renders, stage controls advance through Structure, Connect and Experience, no horizontal overflow or console errors observed.
- Verified layer separation, reset, opt-in dragging, rotation/pause and switching between the walkway and steel-frame studies. Only one canvas is mounted for the selected study.
- Mobile camera framing adjusted to show the stairs more clearly. Final screenshots saved as `redesign-stair-walkway-desktop.jpg` and `redesign-stair-walkway-mobile.jpg`.
- Temporary development server stopped successfully. Static review server remains available on port 3001.

## Cinematic construction hero

- `npm run typecheck`, production GitHub Pages base-path build, and `git diff --check`: passed after integration.
- Browser rendering checked at desktop widths 1280/1139 and mobile width 390. No horizontal overflow or console errors observed.
- Foundations, Steel frame, Architecture and The full picture buttons seek to the expected model stage and stop playback. Progress positions match the selected chapter.
- Replay resets the timeline; automatic playback advances through all four stages and holds the finished model with a Replay control.
- Mobile menu still navigates to Our process. The retained stair-and-walkway Connect stage renders correctly alongside the new hero.
- Canvas rendering stops while paused; offscreen/background and reduced-motion logic reviewed in source. OS reduced-motion emulation and forced WebGL failure were not available through the browser test tools.
- The opening is a live, stylised architectural animation, not an exported video file. No production deployment performed.
- Evidence: `construction-hero-desktop.jpg`, `construction-hero-mobile.jpg`, and `construction-hero-steel.jpg`.
