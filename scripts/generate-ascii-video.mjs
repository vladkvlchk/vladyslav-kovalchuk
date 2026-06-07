#!/usr/bin/env node
/**
 * Convert an MP4 video into a compressed ASCII animation JSON.
 *
 * Usage:
 *   node scripts/generate-ascii-video.mjs \
 *     --input ./A_minimalist_high_contrast_lin.mp4 \
 *     --output ./public/ascii-lilies.json \
 *     --cols 80 --rows 24 --fps 24
 *     # pass --crop W:H:X:Y to focus on a region of the source
 *
 * Output JSON shape:
 *   { w, h, fps, frames: string[] }
 *   - Each frame string contains rows joined by "\n".
 *   - Inside a row, runs of >=3 spaces are RLE-encoded as `~<count>|`
 *     (`~` and `|` are guaranteed not to appear in the brightness ramp).
 */
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// ----- CLI args -------------------------------------------------------------
const argv = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const INPUT = path.resolve(
  projectRoot,
  argv.input ?? "A_minimalist_high_contrast_lin.mp4"
);
const OUTPUT = path.resolve(
  projectRoot,
  argv.output ?? "public/ascii-lilies.json"
);
const COLS = Number(argv.cols ?? 80);
const ROWS = Number(argv.rows ?? 24);
const FPS = Number(argv.fps ?? 24);
// Optional ffmpeg `crop=W:H:X:Y` applied before scaling.
// Defaults to the full frame so the entire source video is preserved.
const CROP = argv.crop ?? "";
// Optional list of `drawbox=W:H:X:Y` masks. Use a CSV list of `X:Y:W:H` rects;
// each is painted pure black before scaling. Default covers the Gemini sparkle
// watermark in the bottom-right of a 1280×720 source.
const MASK = argv.mask ?? "1130:545:60:110";

// Brightness → glyph ramp.
// Index 0 = black, last index = brightest.
// `~` and `|` are intentionally absent so we can use them as RLE markers.
const RAMP = " .:!ilMW@\u2588"; // last char is U+2588 FULL BLOCK
const RAMP_LEN = RAMP.length;

/** Map an 8-bit luma sample to a ramp glyph. */
function lumaToChar(luma) {
  // (luma * RAMP_LEN) >> 8 is a fast int divide by 256
  const idx = Math.min(RAMP_LEN - 1, (luma * RAMP_LEN) >> 8);
  return RAMP[idx];
}

/** Compress runs of >=3 spaces in a single row. */
function rleEncodeRow(row) {
  return row.replace(/ {3,}/g, (m) => `~${m.length}|`);
}

/** Capture all of ffmpeg's stdout into a single Buffer. */
function extractRawGrayFrames() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    const filters = [];
    // Mask out watermarks BEFORE crop/scale so the painted rect is in source
    // pixel space and remains a clean solid-black region after downscale.
    if (MASK) {
      for (const rect of MASK.split(",")) {
        const [x, y, w, h] = rect.split(":");
        filters.push(`drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=black@1:t=fill`);
      }
    }
    if (CROP) filters.push(`crop=${CROP}`);
    // Lanczos preserves edges better than bilinear when downscaling thin lines
    filters.push(`scale=${COLS}:${ROWS}:flags=lanczos`);
    filters.push("format=gray");

    const stream = ffmpeg(INPUT)
      .videoFilters(filters)
      .outputOptions([
        "-an", // strip audio
        "-vsync", "cfr",
        "-r", String(FPS),
        "-pix_fmt", "gray",
      ])
      .outputFormat("rawvideo")
      .on("error", reject)
      .pipe();

    stream.on("data", (c) => {
      chunks.push(c);
      total += c.length;
    });
    stream.on("end", () => resolve(Buffer.concat(chunks, total)));
    stream.on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`Input not found: ${INPUT}`);
  }

  console.log(`→ Input:      ${path.relative(projectRoot, INPUT)}`);
  console.log(`→ Output:     ${path.relative(projectRoot, OUTPUT)}`);
  console.log(`→ Grid:       ${COLS} cols × ${ROWS} rows @ ${FPS} fps`);
  console.log(`→ Crop:       ${CROP || "(none)"}`);
  console.log(`→ Mask:       ${MASK || "(none)"}`);

  const t0 = Date.now();
  const raw = await extractRawGrayFrames();
  const tExtract = Date.now() - t0;

  const frameSize = COLS * ROWS;
  const numFrames = Math.floor(raw.length / frameSize);
  if (numFrames === 0) {
    throw new Error("No frames produced — check input or grid size");
  }
  console.log(
    `→ Extracted:  ${numFrames} frames (${(raw.length / 1024).toFixed(
      1
    )} KB raw) in ${tExtract}ms`
  );

  // ASCII-fy + RLE each frame.
  const t1 = Date.now();
  const frames = new Array(numFrames);
  for (let f = 0; f < numFrames; f++) {
    const base = f * frameSize;
    const rows = new Array(ROWS);
    for (let y = 0; y < ROWS; y++) {
      const rowBase = base + y * COLS;
      let row = "";
      for (let x = 0; x < COLS; x++) {
        row += lumaToChar(raw[rowBase + x]);
      }
      rows[y] = rleEncodeRow(row);
    }
    frames[f] = rows.join("\n");
  }
  const tEncode = Date.now() - t1;

  const json = JSON.stringify({ w: COLS, h: ROWS, fps: FPS, frames });
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, json);

  console.log(`→ Encoded:    ${tEncode}ms`);
  console.log(
    `→ JSON size:  ${(json.length / 1024).toFixed(
      1
    )} KB (gzip-friendly; large space runs RLE'd)`
  );
}

main().catch((err) => {
  console.error("\nFailed to generate ASCII video:");
  console.error(err);
  process.exit(1);
});
