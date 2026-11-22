// Portfolio imagery is captured from the matching client-supplied models.
// No share tokens or external viewer URLs are shipped in the homepage bundle.
// `hd` stills are rendered by scripts/capture-models.mjs (white ground, 2400px);
// the rest fall back to the original 730px captures.
// Architectural renders come from the client's project folders, kept full
// colour in public/images/projects/arch (2400px max, plus a 1200px -sm).
export type Discipline = 'steel' | 'arch';
export type PortfolioProject = {
  id: string; name: string; location: string; category: string;
  image: string; hd: boolean; detail: string; kind: Discipline;
  /** Extra views shown as a strip in the lightbox; the first is `image`. */
  views?: readonly { image: string; label: string }[];
  /** Cover's width / height, so cards can frame it without cropping. */
  ratio?: number;
  /** object-position for the cover when a card must crop it. */
  focus?: string;
  /** A studio design concept (illustrative render), not a client project. */
  concept?: boolean;
  /** Pixel widths of the -sm and full stills, when they differ from 1200/2400. */
  widths?: readonly [number, number];
};

export const portfolio: readonly PortfolioProject[] = ([
  { id: 'PRJ2669', name: '4 Slade Avenue', location: 'Lindfield', category: 'Residential', image: 'slade-avenue', hd: true, detail: 'Residential steelwork, with floor and roof framing coordinated across multiple levels.' },
  { id: 'PRJ2652', name: 'Weston Shed', location: 'Shed structure', category: 'Commercial', image: 'weston-shed', hd: true, detail: 'A complete shed steel model, bringing primary framing, roof members and bracing into one coordinated view.' },
  { id: 'PRJ2635', name: 'Foam Tank 600', location: 'Industrial structure', category: 'Industrial', image: 'foam-tank', hd: true, detail: 'Steel framing for an industrial enclosure, including roof members, columns and cross-bracing.' },
  { id: 'PRJ2674', name: 'Lot 12 Peats Ferry Road', location: 'Residential steelwork', category: 'Residential', image: 'peats-ferry', hd: true, detail: 'A detailed view of the structural members and connections behind a residential project.' },
  { id: 'PRJ2678', name: '1001 Grandview Road', location: 'Residential steelwork', category: 'Residential', image: 'grandview-road', hd: false, detail: 'Residential steel modelling, with the frame and its connecting elements resolved together.' },
  { id: 'PRJ2644', name: '21 Godfrey Street', location: 'Residential steelwork', category: 'Residential', image: 'godfrey-street', hd: true, detail: 'The steel structure documented in three dimensions for a clear view of the project.' },
  { id: 'PRJ2655', name: '438 Kline Street', location: 'Residential steelwork', category: 'Residential', image: 'kline-street', hd: true, detail: 'A coordinated residential steel model, from primary members to supporting details.' },
  { id: 'PRJ2629', name: 'Little Street', location: 'Mosman', category: 'Residential', image: 'little-street', hd: true, detail: 'Stair flights, landings and balustrades modelled together for this Mosman residential project.' },
  { id: 'PRJ2567', name: '262 Burraneer Bay Road', location: 'Residential steelwork', category: 'Residential', image: 'burraneer-bay', hd: true, detail: 'A project model showing the arrangement of the residential steel structure.' },
  { id: 'PRJ2689', name: '3 George Street', location: 'Brunswick', category: 'Residential', image: 'george-street', hd: true, detail: 'Detailed steel modelling for a residential project in Brunswick.' },
] as const).map(p => ({ ...p, kind: 'steel' as const }));

export const architecture: readonly PortfolioProject[] = [
  { id: 'Riverstone', name: 'Newber Street', location: 'Brisbane, QLD', category: 'New build', image: 'newber-street', hd: true, kind: 'arch', ratio: 1785 / 881, focus: '50% 62%',
    views: [{ image: 'newber-street', label: 'Dusk' }, { image: 'newber-street-day', label: 'Day' }, { image: 'newber-street-dawn', label: 'Dawn' }, { image: 'newber-street-night', label: 'Night' }], detail: 'A new build for a Queensland builder. We developed the design from a supplied concept to suit the site, then produced a preliminary set for approval and the full BA set.' },
  { id: 'KDE', name: 'Mulgowrie Crescent', location: 'Sydney, NSW', category: 'Addition & alteration', image: 'mulgowrie-crescent', hd: true, kind: 'arch', ratio: 1575 / 999, focus: '50% 60%',
    views: [{ image: 'mulgowrie-crescent', label: 'Option 02' }, { image: 'mulgowrie-crescent-op2-front', label: 'Option 02, street' }, { image: 'mulgowrie-crescent-op1', label: 'Option 01' }, { image: 'mulgowrie-crescent-op1-front', label: 'Option 01, street' }], detail: 'An addition and alteration to a 35-year-old Sydney home, adding modern architecture while keeping its views to the outdoors. Taken through to DA with the client and town planner.' },
  { id: 'Modular home', name: 'Prefab Studio Module', location: 'Perth, WA', category: 'Design & documentation', image: 'modular-studio', hd: true, kind: 'arch', ratio: 2400 / 1340, focus: '36% 64%',
    views: [{ image: 'modular-studio', label: 'Render' }, { image: 'modular-studio-sketchup', label: 'SketchUp model' }, { image: 'modular-studio-revit', label: 'Revit model' }, { image: 'modular-studio-interior', label: 'Interior study' }], detail: 'Design and documentation for building approval of a prefabricated studio module, built by a modular home company. A compact studio sized for a single person or a couple.' },
  // Studio concepts: illustrative renders exploring form, material and site.
  // Portrait stills (1024 x 1536); listed after client work and shown as a trio.
  ...([
    { id: 'Concept 01', name: 'Brick Arcade Studios', location: 'Corner site', image: 'concept-brick-arcade', focus: '50% 58%',
      detail: 'A two-storey workplace on a street corner. Pale brick arches at ground level, a clerestory band under a floating curved roof, and planted ledges that soften the street edge.' },
    { id: 'Concept 02', name: 'Split-Level Street House', location: 'Sloping block', image: 'concept-split-level', focus: '50% 48%',
      detail: 'A family home stepped into a rising block: garage and garden room at street level, two living floors above, with glazed balconies and timber fins facing the view.' },
    { id: 'Concept 03', name: 'Hillside Bushland Retreat', location: 'Bush block', image: 'concept-hillside', focus: '50% 42%',
      detail: 'A weatherboard home set high on a steep, treed site. Garage and carport stay at the street, and a winding stair climbs through native planting to a wraparound deck.' },
  ] as const).map(p => ({ ...p, category: 'Concept design', hd: true, kind: 'arch' as const, concept: true, ratio: 1024 / 1536, widths: [768, 1024] as const })),
];

export const DISCIPLINE: Record<Discipline, string> = { steel: 'Steel detailing', arch: 'Architectural' };

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
/** `image` picks one of the project's views; it defaults to the cover. */
export const projectSrc = (project: PortfolioProject, size: 'lg' | 'sm' = 'lg', image = project.image) => project.hd
  ? `${base}/images/projects/${project.kind === 'arch' ? 'arch' : 'hd'}/${image}${size === 'sm' ? '-sm' : ''}.webp`
  : `${base}/images/projects/${image}.jpg`;

/** Responsive sources: the 1200px still for small slots, the full one for large or dense screens. */
export const projectSrcSet = (project: PortfolioProject, image = project.image) => project.hd
  ? `${projectSrc(project, 'sm', image)} ${project.widths?.[0] ?? 1200}w, ${projectSrc(project, 'lg', image)} ${project.widths?.[1] ?? 2400}w`
  : undefined;

/** Where each discipline's full archive lives. */
export const ARCHIVE_HREF: Record<Discipline, string> = { steel: '/projects/', arch: '/architecture/' };
