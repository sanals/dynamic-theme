const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/products');

async function trimImages() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  let count = 0;
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const buffer = await sharp(filePath).trim().toBuffer();
      fs.writeFileSync(filePath, buffer);
      console.log(`Trimmed ${file}`);
      count++;
    } catch (e) {
      console.error(`Error trimming ${file}`, e);
    }
  }
  console.log(`Successfully trimmed ${count} images.`);
}

trimImages();
