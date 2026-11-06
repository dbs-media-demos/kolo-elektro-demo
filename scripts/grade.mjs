// One "room at night, one warm lamp" grade for every photo, so shots from different photographers
// read as one shoot. Source: the Unsplash set already licensed in ../universal-trades (see SOURCES.md).
//
//   node scripts/grade.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "../universal-trades/public/images/default");
const out = path.join(root, "src/assets/photos");
await mkdir(out, { recursive: true });

const SET = {
  "gallery-3.jpg": "renovation",
  "gallery-4.jpg": "slats",
  "gallery-5.jpg": "kitchen",
  "detail.jpg": "pendants",
  "service-6.jpg": "panel-test",
  "service-3.jpg": "ev",
  "service-4.jpg": "smart",
  "service-5.jpg": "socket",
  "pill-3.jpg": "switch-fit",
  "service-1.jpg": "lamps",
};

for (const [file, slug] of Object.entries(SET)) {
  await sharp(path.join(src, file))
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .modulate({ saturation: 0.86 })
    .recomb([
      [1.02, 0.0, 0.0],
      [0.0, 0.99, 0.0],
      [0.0, 0.0, 0.93],
    ])
    .linear(1.05, -6)
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(path.join(out, `${slug}.jpg`));
}
console.log(`graded ${Object.keys(SET).length} photos`);
