const sharp = require('sharp');
const path  = require('path');

const src  = path.join(__dirname, '../public/icon.svg');
const dest = path.join(__dirname, '../public');

const icons = [
  { name: 'icon-1024.png', size: 1024 },
  { name: 'apple-touch-icon-180.png', size: 180 },
  { name: 'apple-touch-icon-167.png', size: 167 },
  { name: 'apple-touch-icon-152.png', size: 152 },
  { name: 'apple-touch-icon-120.png', size: 120 },
  { name: 'icon-48.png',  size: 48  },
  { name: 'icon-32.png',  size: 32  },
  { name: 'icon-16.png',  size: 16  },
];

// iPhone splash screen sizes (portrait, @2x and @3x)
const splashes = [
  { name: 'splash-750x1334.png',   w: 750,  h: 1334 }, // iPhone SE
  { name: 'splash-1170x2532.png',  w: 1170, h: 2532 }, // iPhone 14/15, 12/13
  { name: 'splash-1179x2556.png',  w: 1179, h: 2556 }, // iPhone 15 Pro, 14 Pro
  { name: 'splash-1284x2778.png',  w: 1284, h: 2778 }, // iPhone 14 Plus
  { name: 'splash-1290x2796.png',  w: 1290, h: 2796 }, // iPhone 15 Plus/Pro Max
];

(async () => {
  for (const { name, size } of icons) {
    await sharp(src).resize(size, size).png().toFile(`${dest}/${name}`);
    console.log(`✓ ${name}`);
  }

  const ogSrc = path.join(__dirname, '../public/og.svg');
  await sharp(ogSrc).resize(1200, 630).png().toFile(`${dest}/og.png`);
  console.log('✓ og.png');

  const splashSrc = path.join(__dirname, '../public/splash.svg');
  for (const { name, w, h } of splashes) {
    await sharp(splashSrc)
      .resize(w, h, { fit: 'cover', position: 'center' })
      .png()
      .toFile(`${dest}/${name}`);
    console.log(`✓ ${name}`);
  }

  console.log('All done.');
})();
