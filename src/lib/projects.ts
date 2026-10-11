import modelMetadata from './model-metadata.json';

export type Project = { id: string; name: string; category: 'Commercial' | 'Residential' | 'Industrial'; token: string; viewerUrl?: string };
export const projects: Project[] = [
  { id: 'PRJ2652', name: 'Weston Shed', category: 'Commercial', token: '8O8wIkFrtv1q5hVThvrP6Mr-TrM8d6jS1Cr9ZHw3_ocT5n0bkgKVMjPRxc_LZWtQ' },
  { id: 'PRJ2635', name: 'Foam Tank 600', category: 'Industrial', token: 'h6wueHTqgmFZ83GCAQgtwLQR0b985yVbH7iz4uIkB0kg0vFo-ZaCU3h8_tCiyRX7' },
  { id: 'PRJ2674', name: 'Lot 12 Peats Ferry Road', category: 'Residential', token: 'oVm-TTJNKg80ZbQiz9KWjwI2PaSXM3EHv5ikY6P6uggoniEK7VOCj2of_4P1ARAb' },
  { id: 'PRJ2678', name: '1001 Grandview Road', category: 'Residential', token: 'D1qeqYew56JkGJlQ8EJrDPDAZ6dJJwS9c0ppmvSeVvVG5PwIHEWLvM1JtbWrFKhS' },
  { id: 'PRJ2644', name: '21 Godfrey Street', category: 'Residential', token: 'LEDc8eABQIjuAKwu0JIs99qhSodF6TlrQXCZjaJfuOfwtV7lUx3TAXP0RSWLsTaU' },
  { id: 'PRJ2655', name: '438 Kline Street', category: 'Residential', token: 'szVi8v6yOBxBq0O5jnnqGkRS3ERO13PlDp_9ZPhoaxk2WPeTo8XLY927WMcAfRdg' },
  { id: 'PRJ2629', name: 'Little Street, Mosman', category: 'Residential', token: '2QO4WFY2B2NHXJRtJ1CmYX18phpsVfXDybak5pSMxVGWs0MOrRUgYUIgePdXX1Ub' },
  { id: 'PRJ2567', name: '262 Burraneer Bay Road', category: 'Residential', token: 'NhyPLIq7FtqG9qwe0thFZnABhp5yeJCwqhg3txtopENjGWTcdaBnNXPQH01-WQtS' },
  { id: 'PRJ2689', name: '3 George Street, Brunswick', category: 'Residential', token: 'hRKiYV0etzf3mWVARWCu052MG336LWhdZqIioFne0jRaxwA_wJiQlri6C_lcbnjX' },
  { id: 'PRJ2669', name: '4 Slade Avenue, Lindfield', category: 'Residential', token: 'O4PUlhzje-3IQHyglAsK4-aDfXzbABvOHnt_vaYgP9IspJYKvayM7oUh0quhvY1L' },
];
export const shareUrl = (project: Project) => `https://app32.connect.trimble.com/tc/api/2.0/s/${project.token}`;

export const embedUrl = (project: Project) => {
  const meta = (modelMetadata as Record<string, { projectId: string; modelId: string }>)[project.id];
  return meta
    ? `https://web.connect.trimble.com/projects/${encodeURIComponent(meta.projectId)}/viewer/3d/?embed=true&modelId=${encodeURIComponent(meta.modelId)}&origin=app32.connect.trimble.com&stoken=${encodeURIComponent(project.token)}`
    : `https://3d.connect.trimble.com/?stoken=${encodeURIComponent(project.token)}`;
};
