import { useId, type CSSProperties, type ReactNode } from 'react';

/*
 * The hub of the studio diagram: a small blueprint sheet. Each audience has
 * its own drawing, inked in line by line when that audience opens, with
 * dimensions and a title block like a real issued sheet.
 * Sheet is 240 × 240; the drawing area is roughly x 30–210, y 40–170.
 */

const ground = (x1: number, x2: number) => <>
  <path className="sh-line" d={`M${x1} 160H${x2}`}/>
  <path className="sh-thin" d={Array.from({ length: Math.floor((x2 - x1) / 8) }, (_, i) => `M${x1 + 2 + i * 8} 167L${x1 + 8 + i * 8} 161`).join('')}/>
</>;

/** Horizontal dimension with architectural ticks. */
function HDim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return <g className="sh-dim">
    <path d={`M${x1} ${y - 4}V${y + 7}M${x2} ${y - 4}V${y + 7}M${x1 - 4} ${y}H${x2 + 4}M${x1 - 3} ${y + 3}L${x1 + 3} ${y - 3}M${x2 - 3} ${y + 3}L${x2 + 3} ${y - 3}`}/>
    <text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle">{label}</text>
  </g>;
}

/** Vertical dimension, text reading upward. */
function VDim({ y1, y2, x, label }: { y1: number; y2: number; x: number; label: string }) {
  return <g className="sh-dim">
    <path d={`M${x - 7} ${y1}H${x + 4}M${x - 7} ${y2}H${x + 4}M${x} ${y1 - 4}V${y2 + 4}M${x - 3} ${y1 + 3}L${x + 3} ${y1 - 3}M${x - 3} ${y2 + 3}L${x + 3} ${y2 - 3}`}/>
    <text x={x + 4} y={(y1 + y2) / 2} textAnchor="middle" transform={`rotate(-90 ${x + 4} ${(y1 + y2) / 2})`} dy="-1">{label}</text>
  </g>;
}

const DRAWINGS: { title: string; sub: string; scale: string; tone: 'arch' | 'steel' | 'both'; art: ReactNode }[] = [
  { // Homeowners: front elevation of a house
    title: 'Front elevation', sub: 'New residence', scale: '1:100', tone: 'arch',
    art: <>
      {ground(34, 206)}
      <path className="sh-line" d="M60 160V100H180V160"/>
      <path className="sh-line" d="M46 104L120 58L194 104"/>
      <path className="sh-line" d="M150 79V64H162V86"/>
      <path className="sh-line" d="M108 160V124H130V160"/>
      <path className="sh-thin" d="M126 143h-2"/>
      <path className="sh-line" d="M70 112H98V138H70ZM142 112H170V138H142Z"/>
      <path className="sh-thin" d="M84 112V138M156 112V138M70 125H98M142 125H170"/>
      <path className="sh-thin" d="M98 150H140"/>
      <HDim x1={60} x2={180} y={40} label="9600"/>
      <VDim y1={58} y2={160} x={210} label="6250"/>
    </>,
  },
  { // Fabricators: a 310UB40.4 section, true to proportion
    title: '310UB40.4', sub: 'Section A–A', scale: '1:5', tone: 'steel',
    art: <>
      <path className="sh-chain" d="M120 48V170M76 108H164"/>
      <path className="sh-line sh-fill" d="M93 58H147V63.5H122V152.5H147V158H93V152.5H118V63.5H93Z"/>
      <path className="sh-thin" d="M118 63.5q0 3 -3 3M122 63.5q0 3 3 3M118 152.5q0 -3 -3 -3M122 152.5q0 -3 3 -3"/>
      <path className="sh-thin" d="M101 66v2M139 66v2M101 148v2M139 148v2"/>
      <HDim x1={93} x2={147} y={40} label="165"/>
      <VDim y1={58} y2={158} x={176} label="304"/>
    </>,
  },
  { // Builders: steel portal frame, the place both disciplines meet
    title: 'Portal frame', sub: 'Grid A–B', scale: '1:200', tone: 'both',
    art: <>
      {ground(34, 206)}
      <path className="sh-c2" d="M48 89L120 57L192 89"/>
      <path className="sh-line" d="M52 160V92L120 62L188 92V160M60 160V98L120 71L180 98V160"/>
      <path className="sh-line" d="M60 98L60 108L80 89M180 98L180 108L160 89"/>
      <path className="sh-thin" d="M116 61V76M124 61V76"/>
      <path className="sh-line sh-heavy" d="M46 160H66M174 160H194"/>
      <path className="sh-c2" d={[.18, .36, .54, .72, .9].flatMap(t => [[52 + 68 * t, 92 - 30 * t], [188 - 68 * t, 92 - 30 * t]]).map(([x, y]) => `M${x - 2} ${y - 5}h4v3h-4z`).join('')}/>
      <path className="sh-chain" d="M56 50V172M184 50V172"/>
      <HDim x1={56} x2={184} y={40} label="18000"/>
      <VDim y1={92} y2={160} x={210} label="6000"/>
    </>,
  },
  { // Design teams: a floor plan with door swings and openings
    title: 'Floor plan', sub: 'Ground level', scale: '1:100', tone: 'arch',
    art: <>
      <path className="sh-line" d="M48 58H192V158H48ZM53 63H187V153H53Z"/>
      <path className="sh-line" d="M118 63V78M118 94V112M53 112H96M114 112H187"/>
      <path className="sh-thin" d="M96 112V94A18 18 0 0 1 114 112M118 94H134A16 16 0 0 0 118 78"/>
      <path className="sh-gap" d="M68 58V63M98 58V63M146 153V158M176 153V158M48 128V146M53 128V146"/>
      <path className="sh-thin" d="M68 60.5H98M146 155.5H176M50.5 128V146"/>
      <path className="sh-thin" d="M140 112V153M140 124H187"/>
      <path className="sh-chain" d="M40 108H200"/>
      <HDim x1={48} x2={192} y={40} label="14400"/>
      <VDim y1={58} y2={158} x={210} label="10000"/>
    </>,
  },
];

/** Sheet details for captions rendered outside the drawing. */
export const sheetInfo = (index: number) => ({ title: DRAWINGS[index].title, scale: DRAWINGS[index].scale });

/**
 * `drawingOnly` crops to the drawing itself, without the frame and title
 * block, so it can fill a card of any proportion on phones. Each sheet has
 * its own hatch id, as the desktop sheet is display:none on phones and a
 * pattern can't be referenced from inside hidden content.
 */
export default function StudioSheet({ index, drawingOnly = false }: { index: number; drawingOnly?: boolean }) {
  const d = DRAWINGS[index];
  const hatch = `sh-hatch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const defs = <defs>
    <pattern id={hatch} className="sh-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="4"/>
    </pattern>
  </defs>;
  const style = { '--hatch': `url(#${hatch})` } as CSSProperties;

  if (drawingOnly) return <svg className={`sh sh-${d.tone}`} style={style} viewBox="26 26 196 152" aria-hidden="true">
    {defs}
    <g key={index} className="sh-art">{d.art}</g>
  </svg>;

  return <svg className={`sh sh-${d.tone}`} style={style} viewBox="0 0 240 240" aria-hidden="true">
    {defs}
    <rect className="sh-frame" x="8" y="8" width="224" height="224" rx="6"/>
    <path className="sh-frame" d="M8 194H232M86 194V232M180 194V232"/>
    <path className="sh-crop" d="M16 22V16H22M218 16H224V22M16 182V188H22M224 182V188H218"/>

    <g key={index} className="sh-art">{d.art}</g>

    <text className="sh-logo" x="47" y="216" textAnchor="middle">KD<tspan>X</tspan></text>
    <text className="sh-small" x="47" y="226" textAnchor="middle">NOWRA · NSW</text>
    <g key={`t${index}`} className="sh-title">
      <text className="sh-name" x="94" y="210">{d.title.toUpperCase()}</text>
      <text className="sh-small" x="94" y="222">{d.sub.toUpperCase()}</text>
    </g>
    <text key={`s${index}`} className="sh-small sh-title" x="206" y="210" textAnchor="middle">{d.scale}</text>
    <text key={`n${index}`} className="sh-name sh-title" x="206" y="222" textAnchor="middle">04–0{index + 1}</text>
  </svg>;
}
