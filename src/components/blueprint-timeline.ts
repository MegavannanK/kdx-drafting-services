// Shared timing for the full-bleed hero. The scene and the DOM overlay both read
// from the same clock, so phase labels, progress and lighting stay in sync.
export const DURATION = 9;
/** The moment the building steps aside and the page UI arrives. */
export const REVEAL_AT = 6.6;

export const PHASES = [
  { name: 'Plan', start: 0, end: 2.2 },
  { name: 'Steel', start: 2.2, end: 4.4 },
  { name: 'Envelope', start: 4.4, end: 6.6 },
  { name: 'Complete', start: 6.6, end: DURATION },
] as const;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smooth = (time: number, start: number, length: number) => {
  const x = clamp01((time - start) / length);
  return x * x * (3 - 2 * x);
};
export const phaseAt = (time: number) => {
  for (let i = PHASES.length - 1; i >= 0; i--) if (time >= PHASES[i].start) return i;
  return 0;
};
/** 0 → blueprint night, 1 → finished building at blue hour with interiors lit. */
export const duskAt = (time: number) => smooth(time, 5.9, 2.4);
