// Regenerates the favicon set with the brand wordmark in Space Grotesk.
// Source of truth: ilo Design System handoff (chats/chat2.md) — Space Grotesk
// 700 swapped in to fix the system-ui rendering bug in the previous favicon.

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FONT = readFileSync(
  resolve(
    process.cwd(),
    'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
  ),
);

// Tile dimensions are normalised to 32 — satori scales linearly via the
// outer width/height. Inside the tile we keep the same proportions as the
// hand-authored 32x32 SVG: 8/32 corner radius, wordmark optically centred.
function tile(size) {
  const fontSize = size * 0.5; // 16 at 32px — matches prior hand-tuned value
  const radius = size * 0.25; // 8 at 32px
  return {
    type: 'div',
    props: {
      style: {
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a10',
        borderRadius: `${radius}px`,
        fontFamily: 'Space Grotesk',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              color: '#e09422',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              // Optical baseline tweak — Space Grotesk hangs slightly low.
              marginTop: `${-size * 0.04}px`,
            },
            children: 'ilo',
          },
        },
      ],
    },
  };
}

async function renderPng(size) {
  const svg = await satori(tile(size), {
    width: size,
    height: size,
    fonts: [
      { name: 'Space Grotesk', data: FONT, weight: 700, style: 'normal' },
    ],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

// Hand-authored SVG favicon — embedded @import so modern browsers render
// in Space Grotesk directly. The PNGs below cover everything else.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&amp;display=swap');</style>
  <rect width="32" height="32" rx="8" fill="#0a0a10"/>
  <text x="16" y="22" text-anchor="middle"
        font-family="'Space Grotesk', system-ui, sans-serif"
        font-weight="700" font-size="17"
        letter-spacing="-0.04em"
        fill="#e09422">ilo</text>
</svg>
`;

const PUB = resolve(process.cwd(), 'public');
writeFileSync(resolve(PUB, 'favicon.svg'), SVG);

const sizes = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['favicon-180x180.png', 180],
  ['favicon-192x192.png', 192],
  ['favicon-512x512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of sizes) {
  const png = await renderPng(size);
  writeFileSync(resolve(PUB, name), png);
  console.log(`wrote public/${name} (${size}x${size})`);
}

console.log('wrote public/favicon.svg');
