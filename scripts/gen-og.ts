import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 630;

const svg = /* html */`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#0d0b14"/>
      <stop offset="100%" stop-color="#110e1f"/>
    </linearGradient>

    <!-- Logo mark gradient -->
    <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#1e1b4b"/>
    </linearGradient>

    <!-- Title gradient -->
    <linearGradient id="titleGrad" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#7c3aed"/>
      <stop offset="50%"  stop-color="#f06292"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>

    <!-- Glow radial -->
    <radialGradient id="glow" cx="50%" cy="40%" r="55%" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#7c3aed" stop-opacity="0.18"/>
      <stop offset="60%"  stop-color="#f06292" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0d0b14" stop-opacity="0"/>
    </radialGradient>

    <!-- Dot grid mask -->
    <radialGradient id="gridMask" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
      <stop offset="20%" stop-color="white" stop-opacity="1"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridFade">
      <rect width="${W}" height="${H}" fill="url(#gridMask)"/>
    </mask>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Dot grid -->
  <g mask="url(#gridFade)" opacity="0.5">
    ${Array.from({ length: Math.ceil(H / 28) }, (_, row) =>
      Array.from({ length: Math.ceil(W / 28) }, (_, col) =>
        `<circle cx="${col * 28 + 14}" cy="${row * 28 + 14}" r="1" fill="#7c3aed" opacity="0.25"/>`
      ).join("")
    ).join("")}
  </g>

  <!-- Glow orb -->
  <ellipse cx="${W / 2}" cy="260" rx="700" ry="400" fill="url(#glow)"/>

  <!-- Logo mark (64×64) -->
  <rect x="136" y="233" width="64" height="64" rx="16" fill="url(#logoGrad)"/>
  <rect x="136" y="233" width="64" height="64" rx="16" fill="none" stroke="white" stroke-opacity="0.12" stroke-width="1.5"/>
  <!-- N lines -->
  <line x1="154" y1="249" x2="154" y2="281" stroke="white" stroke-width="3.5" stroke-opacity="0.6" stroke-linecap="round"/>
  <line x1="154" y1="249" x2="182" y2="281" stroke="white" stroke-width="3.5" stroke-opacity="0.6" stroke-linecap="round"/>
  <line x1="182" y1="249" x2="182" y2="281" stroke="white" stroke-width="3.5" stroke-opacity="0.6" stroke-linecap="round"/>
  <!-- Node circles -->
  <circle cx="154" cy="249" r="5" fill="white" fill-opacity="0.95"/>
  <circle cx="154" cy="281" r="5" fill="white" fill-opacity="0.95"/>
  <circle cx="182" cy="249" r="5" fill="white" fill-opacity="0.95"/>
  <circle cx="182" cy="281" r="5" fill="white" fill-opacity="0.95"/>

  <!-- Title -->
  <text
    x="222" y="280"
    font-family="'Inter', system-ui, -apple-system, sans-serif"
    font-size="72"
    font-weight="800"
    letter-spacing="-3"
    fill="url(#titleGrad)"
    dominant-baseline="auto"
  >nestelia</text>

  <!-- Tagline -->
  <text
    x="${W / 2}" y="360"
    text-anchor="middle"
    font-family="'Inter', system-ui, -apple-system, sans-serif"
    font-size="24"
    font-weight="400"
    fill="white"
    fill-opacity="0.45"
    letter-spacing="0.2"
  >Modular framework for Elysia and Bun  ·  Decorators · DI · Modules</text>

  <!-- Bottom border glow -->
  <rect x="0" y="${H - 3}" width="${W}" height="3" fill="url(#titleGrad)" opacity="0.6"/>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: { loadSystemFonts: true },
});

const png = resvg.render().asPng();
writeFileSync("docs/public/og.png", png);
console.log("✓ docs/public/og.png generated");
