import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Download offer images
offers.forEach(async (offer, idx) => {
  if (offer.imageUrl && offer.imageUrl.startsWith('http')) {
    const dest = path.join(__dirname, 'public', 'images', 'offers', `offer-${idx + 1}.svg`);
    await download(offer.imageUrl, dest);
    console.log(`Downloaded offer image: offer-${idx + 1}.svg`);
  }
});

// Download restaurant brand images (if any are URLs)
restaurants.forEach(async (rest, idx) => {
  if (rest.brandUrl && rest.brandUrl.startsWith('http')) {
    const ext = path.extname(rest.brandUrl).split('?')[0] || '.svg';
    const dest = path.join(__dirname, 'public', 'images', 'restaurants', `hotel-${idx + 1}${ext}`);
    await download(rest.brandUrl, dest);
    console.log(`Downloaded restaurant image: hotel-${idx + 1}${ext}`);
  }
});