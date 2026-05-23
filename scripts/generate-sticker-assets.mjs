import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const stickers = [
  "great-wall",
  "temple-of-heaven",
  "oriental-pearl",
  "golden-gate",
  "statue-of-liberty",
  "mountaineering",
  "surfing",
  "swimming",
  "frisbee",
  "camping",
  "salmon",
  "beef",
  "shrimp",
  "milk",
  "small-ball"
];

mkdirSync(join(root, "public/assets/stickers/pixel"), { recursive: true });
mkdirSync(join(root, "public/assets/stickers/realistic"), { recursive: true });

for (const name of stickers) {
  writeFileSync(join(root, `public/assets/stickers/pixel/${name}.svg`), makeSvg(name, "pixel"));
  writeFileSync(join(root, `public/assets/stickers/realistic/${name}.svg`), makeSvg(name, "realistic"));
}

function makeSvg(name, style) {
  const isPixel = style === "pixel";
  const body = isPixel ? pixelArt(name) : realisticArt(name);
  const filter = isPixel
    ? ""
    : `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#12302a" flood-opacity=".28"/></filter>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="warm" x1="16" y1="16" x2="112" y2="112"><stop stop-color="#ffd166"/><stop offset="1" stop-color="#ef476f"/></linearGradient>
    <linearGradient id="cool" x1="16" y1="112" x2="112" y2="16"><stop stop-color="#4cc9f0"/><stop offset="1" stop-color="#2d6a4f"/></linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4f1de"/><stop offset="1" stop-color="#8d99ae"/></linearGradient>
    ${filter}
  </defs>
  <rect x="8" y="8" width="112" height="112" rx="${isPixel ? 0 : 24}" fill="${isPixel ? "#f8fbf9" : "#ffffff"}"/>
  <g filter="${isPixel ? "" : "url(#soft)"}">
    ${body}
  </g>
</svg>
`;
}

function pixelArt(name) {
  const shared = {
    "great-wall": `<rect x="14" y="74" width="16" height="14" fill="#9b5d30"/><rect x="30" y="68" width="16" height="14" fill="#b46b36"/><rect x="46" y="62" width="16" height="14" fill="#9b5d30"/><rect x="62" y="58" width="16" height="14" fill="#b46b36"/><rect x="78" y="54" width="18" height="16" fill="#9b5d30"/><rect x="96" y="58" width="18" height="16" fill="#b46b36"/><rect x="18" y="46" width="18" height="28" fill="#5f3b25"/><rect x="86" y="34" width="22" height="28" fill="#5f3b25"/><rect x="16" y="38" width="22" height="8" fill="#d08742"/><rect x="84" y="26" width="26" height="8" fill="#d08742"/>`,
    "temple-of-heaven": `<rect x="44" y="76" width="40" height="18" fill="#2d6a4f"/><rect x="36" y="68" width="56" height="8" fill="#f4a261"/><rect x="42" y="58" width="44" height="10" fill="#1d3557"/><rect x="50" y="48" width="28" height="10" fill="#2a9d8f"/><rect x="54" y="36" width="20" height="12" fill="#e76f51"/><rect x="48" y="94" width="32" height="8" fill="#8d99ae"/>`,
    "oriental-pearl": `<rect x="60" y="26" width="8" height="76" fill="#283618"/><rect x="52" y="50" width="24" height="8" fill="#457b9d"/><rect x="48" y="72" width="32" height="8" fill="#457b9d"/><rect x="48" y="22" width="32" height="32" fill="#ff6b6b"/><rect x="42" y="68" width="44" height="28" fill="#f72585"/><rect x="56" y="10" width="16" height="12" fill="#f4a261"/>`,
    "golden-gate": `<rect x="26" y="34" width="12" height="58" fill="#c44536"/><rect x="90" y="34" width="12" height="58" fill="#c44536"/><rect x="18" y="56" width="92" height="8" fill="#e76f51"/><rect x="18" y="78" width="92" height="8" fill="#e76f51"/><rect x="34" y="42" width="60" height="6" fill="#ffd166"/><rect x="12" y="94" width="104" height="8" fill="#4cc9f0"/>`,
    "statue-of-liberty": `<rect x="56" y="48" width="18" height="44" fill="#2a9d8f"/><rect x="52" y="90" width="28" height="10" fill="#1b7f71"/><rect x="48" y="102" width="36" height="10" fill="#59656f"/><rect x="54" y="34" width="24" height="16" fill="#52b788"/><rect x="44" y="28" width="8" height="18" fill="#52b788"/><rect x="78" y="24" width="8" height="22" fill="#52b788"/><rect x="64" y="12" width="8" height="24" fill="#ffd166"/>`,
    mountaineering: `<polygon points="16,100 50,40 78,100" fill="#6c757d"/><polygon points="50,40 62,62 42,62" fill="#f8f9fa"/><polygon points="50,100 86,34 116,100" fill="#495057"/><polygon points="86,34 98,58 76,58" fill="#f8f9fa"/><rect x="88" y="24" width="6" height="24" fill="#283618"/><rect x="94" y="24" width="18" height="10" fill="#ef476f"/>`,
    surfing: `<rect x="18" y="78" width="92" height="14" fill="#4cc9f0"/><rect x="30" y="66" width="56" height="10" fill="#90e0ef"/><rect x="54" y="50" width="46" height="8" fill="#ffd166" transform="rotate(-18 77 54)"/><rect x="64" y="36" width="8" height="20" fill="#2d6a4f"/><rect x="60" y="28" width="16" height="10" fill="#f4a261"/>`,
    swimming: `<rect x="12" y="80" width="28" height="10" fill="#4cc9f0"/><rect x="48" y="80" width="28" height="10" fill="#4cc9f0"/><rect x="84" y="80" width="28" height="10" fill="#4cc9f0"/><rect x="36" y="58" width="26" height="12" fill="#f4a261"/><rect x="58" y="48" width="20" height="10" fill="#1d3557"/><rect x="72" y="56" width="24" height="8" fill="#2a9d8f"/>`,
    frisbee: `<rect x="30" y="52" width="68" height="18" fill="#ef476f"/><rect x="38" y="46" width="52" height="10" fill="#ffd166"/><rect x="42" y="70" width="44" height="8" fill="#8ecae6"/>`,
    camping: `<polygon points="22,96 64,34 106,96" fill="#2d6a4f"/><polygon points="48,96 64,58 80,96" fill="#ffd166"/><rect x="60" y="58" width="8" height="38" fill="#1b4332"/><rect x="28" y="96" width="72" height="8" fill="#6c584c"/><rect x="54" y="106" width="8" height="10" fill="#e76f51"/><rect x="66" y="106" width="8" height="10" fill="#f4a261"/>`,
    salmon: `<rect x="26" y="54" width="58" height="28" fill="#ef476f"/><rect x="82" y="58" width="20" height="20" fill="#f4a261"/><rect x="16" y="62" width="16" height="12" fill="#ef476f"/><rect x="94" y="50" width="10" height="12" fill="#1d3557"/><rect x="94" y="76" width="10" height="12" fill="#1d3557"/>`,
    beef: `<rect x="28" y="42" width="72" height="48" fill="#b23a48"/><rect x="42" y="54" width="28" height="20" fill="#f7cad0"/><rect x="76" y="62" width="12" height="10" fill="#f4a261"/><rect x="36" y="90" width="52" height="10" fill="#6f1d1b"/>`,
    shrimp: `<rect x="30" y="58" width="16" height="18" fill="#ff8fab"/><rect x="46" y="50" width="18" height="20" fill="#fb6f92"/><rect x="64" y="50" width="18" height="18" fill="#ff8fab"/><rect x="82" y="58" width="14" height="14" fill="#fb6f92"/><rect x="28" y="76" width="16" height="8" fill="#ffd166"/><rect x="94" y="68" width="18" height="6" fill="#fb6f92"/>`,
    milk: `<rect x="42" y="38" width="44" height="64" fill="#f8f9fa"/><rect x="42" y="54" width="44" height="16" fill="#4cc9f0"/><rect x="48" y="28" width="32" height="12" fill="#8ecae6"/><rect x="52" y="74" width="24" height="16" fill="#ffffff"/>`,
    "small-ball": `<rect x="40" y="36" width="48" height="48" fill="#ffd166"/><rect x="52" y="36" width="12" height="48" fill="#2a9d8f"/><rect x="40" y="52" width="48" height="12" fill="#ef476f"/><rect x="48" y="84" width="32" height="8" fill="#c95d32"/>`
  };

  return shared[name];
}

function realisticArt(name) {
  const shared = {
    "great-wall": `<path d="M14 88c26-30 55-8 100-42v18c-39 27-73 15-100 42z" fill="url(#stone)"/><path d="M18 86h22v18H18zM80 56h28v28H80z" fill="#6f4e37"/><path d="M15 82h28v8H15zM76 50h36v9H76z" fill="#d08952"/><path d="M18 68c32-18 52-2 92-32" fill="none" stroke="#b86f3a" stroke-width="8" stroke-linecap="round"/>`,
    "temple-of-heaven": `<ellipse cx="64" cy="94" rx="38" ry="8" fill="#8d99ae"/><path d="M34 75h60l-8 20H42z" fill="#2d6a4f"/><path d="M29 70c18-12 52-12 70 0l-6 9H35z" fill="#f4a261"/><path d="M40 58c14-12 34-12 48 0l-6 11H46z" fill="#1d3557"/><path d="M52 44c7-8 17-8 24 0l-4 13H56z" fill="#e76f51"/>`,
    "oriental-pearl": `<path d="M63 18h4v90h-4z" fill="#233d4d"/><circle cx="65" cy="36" r="18" fill="url(#warm)"/><circle cx="65" cy="75" r="25" fill="#d946ef"/><path d="M46 58h38M40 88h50" stroke="#264653" stroke-width="7" stroke-linecap="round"/><path d="M55 16h20l-10-8z" fill="#ffd166"/>`,
    "golden-gate": `<path d="M14 88h100" stroke="#4cc9f0" stroke-width="10" stroke-linecap="round"/><path d="M22 64h84M22 80h84" stroke="#e76f51" stroke-width="8" stroke-linecap="round"/><path d="M31 36v56M97 36v56" stroke="#c44536" stroke-width="12" stroke-linecap="round"/><path d="M31 40c21 26 45 26 66 0" fill="none" stroke="#ffd166" stroke-width="5"/>`,
    "statue-of-liberty": `<path d="M55 50h22l7 46H48z" fill="#52b788"/><path d="M47 99h38v12H47z" fill="#59656f"/><path d="M52 37h26l-4 16H56z" fill="#2a9d8f"/><path d="M44 42l-12-16M80 42l18-24" stroke="#52b788" stroke-width="7" stroke-linecap="round"/><path d="M64 31l6-22" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>`,
    mountaineering: `<path d="M12 101l36-64 18 32 22-40 28 72z" fill="#6c757d"/><path d="M48 37l11 20H38zM88 29l13 24H75z" fill="#ffffff"/><path d="M89 23v24" stroke="#283618" stroke-width="5"/><path d="M93 24h22l-5 13H93z" fill="#ef476f"/>`,
    surfing: `<path d="M15 86c26-30 48 8 96-18-12 31-70 42-96 18z" fill="#4cc9f0"/><path d="M31 70c23-22 38-2 62-13" fill="none" stroke="#90e0ef" stroke-width="10" stroke-linecap="round"/><path d="M50 60l50-17" stroke="#ffd166" stroke-width="10" stroke-linecap="round"/><circle cx="68" cy="34" r="8" fill="#f4a261"/><path d="M65 43l9 18" stroke="#2d6a4f" stroke-width="7" stroke-linecap="round"/>`,
    swimming: `<path d="M12 84c13-12 25 12 38 0s25 12 38 0 25 12 28 0" fill="none" stroke="#4cc9f0" stroke-width="10" stroke-linecap="round"/><path d="M34 62c20-14 40-8 62 2" fill="none" stroke="#2a9d8f" stroke-width="9" stroke-linecap="round"/><circle cx="68" cy="45" r="11" fill="#f4a261"/><path d="M60 40h18" stroke="#1d3557" stroke-width="5" stroke-linecap="round"/>`,
    frisbee: `<ellipse cx="64" cy="61" rx="42" ry="17" fill="url(#warm)"/><ellipse cx="64" cy="56" rx="30" ry="8" fill="#ffd166"/><path d="M28 69c18 18 54 18 72 0" fill="none" stroke="#8ecae6" stroke-width="7" stroke-linecap="round"/>`,
    camping: `<path d="M18 98l46-66 46 66z" fill="#2d6a4f"/><path d="M50 98l14-37 16 37z" fill="#ffd166"/><path d="M64 33v65" stroke="#1b4332" stroke-width="5"/><path d="M47 111c10-15 22-15 32 0" fill="#e76f51"/><path d="M58 111c4-9 8-9 12 0" fill="#ffd166"/>`,
    salmon: `<path d="M19 69c23-27 63-27 88 0-25 27-65 27-88 0z" fill="#ef476f"/><path d="M95 69l20-17v34z" fill="#f4a261"/><circle cx="42" cy="61" r="5" fill="#1d3557"/><path d="M52 84c10-9 28-9 38 0" fill="none" stroke="#ffd166" stroke-width="5" stroke-linecap="round"/>`,
    beef: `<path d="M27 63c0-23 18-35 42-31 25 4 39 24 29 45-11 22-45 28-62 14-6-5-9-14-9-28z" fill="#b23a48"/><path d="M45 61c3-14 19-18 30-10 12 10 4 27-12 28-13 1-21-7-18-18z" fill="#f7cad0"/><path d="M78 75c8 0 13-3 18-8" fill="none" stroke="#6f1d1b" stroke-width="5" stroke-linecap="round"/>`,
    shrimp: `<path d="M32 76c4-31 47-38 67-13 12 14-8 35-28 25" fill="none" stroke="#fb6f92" stroke-width="18" stroke-linecap="round"/><path d="M35 80l-18 9M100 65l18-8" stroke="#fb6f92" stroke-width="5" stroke-linecap="round"/><circle cx="85" cy="54" r="4" fill="#1d3557"/><path d="M50 59l-9 24M65 55l-5 32" stroke="#ffd166" stroke-width="4"/>`,
    milk: `<path d="M42 39l13-15h28l5 15v66H42z" fill="#ffffff"/><path d="M42 55h46v22H42z" fill="#4cc9f0"/><path d="M55 24v15h33" fill="none" stroke="#8ecae6" stroke-width="5"/><path d="M53 86h24" stroke="#d8e2dc" stroke-width="8" stroke-linecap="round"/>`,
    "small-ball": `<circle cx="64" cy="62" r="34" fill="#ffd166"/><path d="M39 38c15 16 35 37 50 65" fill="none" stroke="#ef476f" stroke-width="9"/><path d="M34 64h60" stroke="#2a9d8f" stroke-width="9" stroke-linecap="round"/><ellipse cx="64" cy="101" rx="28" ry="7" fill="#c95d32" opacity=".35"/>`
  };

  return shared[name];
}
