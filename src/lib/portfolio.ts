// Portfolio imagery is captured from the matching client-supplied models.
// No share tokens or external viewer URLs are shipped in the homepage bundle.
// `hd` stills are rendered by scripts/capture-models.mjs (white ground, 2400px);
// the rest fall back to the original 730px captures.
export const portfolio = [
  { id: 'PRJ2669', name: '4 Slade Avenue', location: 'Lindfield', category: 'Residential', image: 'slade-avenue', hd: true, detail: 'Residential steelwork, with floor and roof framing coordinated across multiple levels.' },
  { id: 'PRJ2652', name: 'Weston Shed', location: 'Shed structure', category: 'Sheds & commercial', image: 'weston-shed', hd: true, detail: 'A complete shed steel model, bringing primary framing, roof members and bracing into one coordinated view.' },
  { id: 'PRJ2635', name: 'Foam Tank 600', location: 'Industrial structure', category: 'Industrial', image: 'foam-tank', hd: true, detail: 'Steel framing for an industrial enclosure, including roof members, columns and cross-bracing.' },
  { id: 'PRJ2674', name: 'Lot 12 Peats Ferry Road', location: 'Residential steelwork', category: 'Residential', image: 'peats-ferry', hd: true, detail: 'A detailed view of the structural members and connections behind a residential project.' },
  { id: 'PRJ2678', name: '1001 Grandview Road', location: 'Residential steelwork', category: 'Residential', image: 'grandview-road', hd: false, detail: 'Residential steel modelling, with the frame and its connecting elements resolved together.' },
  { id: 'PRJ2644', name: '21 Godfrey Street', location: 'Residential steelwork', category: 'Residential', image: 'godfrey-street', hd: true, detail: 'The steel structure documented in three dimensions for a clear view of the project.' },
  { id: 'PRJ2655', name: '438 Kline Street', location: 'Residential steelwork', category: 'Residential', image: 'kline-street', hd: true, detail: 'A coordinated residential steel model, from primary members to supporting details.' },
  { id: 'PRJ2629', name: 'Little Street', location: 'Mosman', category: 'Residential', image: 'little-street', hd: true, detail: 'Stair flights, landings and balustrades modelled together for this Mosman residential project.' },
  { id: 'PRJ2567', name: '262 Burraneer Bay Road', location: 'Residential steelwork', category: 'Residential', image: 'burraneer-bay', hd: true, detail: 'A project model showing the arrangement of the residential steel structure.' },
  { id: 'PRJ2689', name: '3 George Street', location: 'Brunswick', category: 'Residential', image: 'george-street', hd: true, detail: 'Detailed steel modelling for a residential project in Brunswick.' },
] as const;
export type PortfolioProject = typeof portfolio[number];

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const projectSrc = (project: PortfolioProject, size: 'lg' | 'sm' = 'lg') => project.hd
  ? `${base}/images/projects/hd/${project.image}${size === 'sm' ? '-sm' : ''}.webp`
  : `${base}/images/projects/${project.image}.jpg`;
