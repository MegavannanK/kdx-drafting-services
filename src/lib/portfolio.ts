// Portfolio imagery is captured from the matching client-supplied models.
// No share tokens or external viewer URLs are shipped in the homepage bundle.
export const portfolio = [
  { id: 'PRJ2669', name: '4 Slade Avenue', location: 'Lindfield', category: 'Residential', image: 'slade-avenue', detail: 'Residential steelwork, with floor and roof framing coordinated across multiple levels.' },
  { id: 'PRJ2652', name: 'Weston Shed', location: 'Shed structure', category: 'Sheds & commercial', image: 'weston-shed', detail: 'A complete shed steel model, bringing primary framing, roof members and bracing into one coordinated view.' },
  { id: 'PRJ2635', name: 'Foam Tank 600', location: 'Industrial structure', category: 'Industrial', image: 'foam-tank', detail: 'Steel framing for an industrial enclosure, including roof members, columns and cross-bracing.' },
  { id: 'PRJ2674', name: 'Lot 12 Peats Ferry Road', location: 'Residential steelwork', category: 'Residential', image: 'peats-ferry', detail: 'A detailed view of the structural members and connections behind a residential project.' },
  { id: 'PRJ2678', name: '1001 Grandview Road', location: 'Residential steelwork', category: 'Residential', image: 'grandview-road', detail: 'Residential steel modelling, with the frame and its connecting elements resolved together.' },
  { id: 'PRJ2644', name: '21 Godfrey Street', location: 'Residential steelwork', category: 'Residential', image: 'godfrey-street', detail: 'The steel structure documented in three dimensions for a clear view of the project.' },
  { id: 'PRJ2655', name: '438 Kline Street', location: 'Residential steelwork', category: 'Residential', image: 'kline-street', detail: 'A coordinated residential steel model, from primary members to supporting details.' },
  { id: 'PRJ2629', name: 'Little Street', location: 'Mosman', category: 'Residential', image: 'little-street', detail: 'Stair flights, landings and balustrades modelled together for this Mosman residential project.' },
  { id: 'PRJ2567', name: '262 Burraneer Bay Road', location: 'Residential steelwork', category: 'Residential', image: 'burraneer-bay', detail: 'A project model showing the arrangement of the residential steel structure.' },
  { id: 'PRJ2689', name: '3 George Street', location: 'Brunswick', category: 'Residential', image: 'george-street', detail: 'Detailed steel modelling for a residential project in Brunswick.' },
] as const;
export type PortfolioProject = typeof portfolio[number];
