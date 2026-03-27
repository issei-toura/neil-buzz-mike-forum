/**
 * Rasterize assets/images/icon.svg into PNGs referenced by app.json.
 * Run: node scripts/generate-app-icons.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(__dirname, "../assets/images");
const SVG_PATH = path.join(ASSETS_DIR, "icon.svg");

/** Matches ForumColors.purple and expo.android.adaptiveIcon.backgroundColor */
const BACKGROUND = "#6537FF";
const APP_ICON_SIZE = 1024;
/** Vertical logo in Figma (~120×179); scale to fill ~72% of square height */
const GLYPH_HEIGHT_FRAC = 0.72;

async function main() {
  const svgBuf = fs.readFileSync(SVG_PATH);
  const { width: vw = 120, height: vh = 179 } = await sharp(svgBuf).metadata();
  const aspect = vw / vh;

  const targetH = Math.round(APP_ICON_SIZE * GLYPH_HEIGHT_FRAC);
  const targetW = Math.round(targetH * aspect);

  const glyphPng = await sharp(svgBuf)
    .resize(targetW, targetH, { fit: "inside" })
    .png()
    .toBuffer();

  const { width: gw, height: gh } = await sharp(glyphPng).metadata();
  const left = Math.round((APP_ICON_SIZE - gw) / 2);
  const top = Math.round((APP_ICON_SIZE - gh) / 2);

  await sharp({
    create: {
      width: APP_ICON_SIZE,
      height: APP_ICON_SIZE,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: glyphPng, left, top }])
    .png()
    .toFile(path.join(ASSETS_DIR, "icon.png"));

  await sharp({
    create: {
      width: APP_ICON_SIZE,
      height: APP_ICON_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: glyphPng, left, top }])
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-foreground.png"));

  await sharp({
    create: {
      width: APP_ICON_SIZE,
      height: APP_ICON_SIZE,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-background.png"));

  await sharp({
    create: {
      width: APP_ICON_SIZE,
      height: APP_ICON_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: glyphPng, left, top }])
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-monochrome.png"));

  const favSize = 48;
  const favH = Math.round(favSize * GLYPH_HEIGHT_FRAC);
  const favW = Math.round(favH * aspect);
  const favGlyph = await sharp(svgBuf)
    .resize(favW, favH, { fit: "inside" })
    .png()
    .toBuffer();
  const { width: fgw, height: fgh } = await sharp(favGlyph).metadata();
  const favLeft = Math.round((favSize - fgw) / 2);
  const favTop = Math.round((favSize - fgh) / 2);
  await sharp({
    create: {
      width: favSize,
      height: favSize,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: favGlyph, left: favLeft, top: favTop }])
    .png()
    .toFile(path.join(ASSETS_DIR, "favicon.png"));

  const splashImageWidth = 200;
  const splashH = Math.round(splashImageWidth * GLYPH_HEIGHT_FRAC);
  const splashGlyphW = Math.round(splashH * aspect);
  const splashGlyph = await sharp(svgBuf)
    .resize(splashGlyphW, splashH, { fit: "inside" })
    .png()
    .toBuffer();
  const { width: sgw, height: sgh } = await sharp(splashGlyph).metadata();
  const splashCanvasH = sgh;
  const splashLeft = Math.round((splashImageWidth - sgw) / 2);
  await sharp({
    create: {
      width: splashImageWidth,
      height: splashCanvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: splashGlyph, left: splashLeft, top: 0 }])
    .png()
    .toFile(path.join(ASSETS_DIR, "splash-icon.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
