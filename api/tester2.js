import { getPalette } from 'colorthief';
import axios from 'axios';
import sharp from 'sharp';


async function extractColors(imageUrl) {
    try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = await sharp(Buffer.from(response.data))
        .resize(100)
        .toBuffer();
      const colorPalette = await getPalette(buffer);
        console.log(colorPalette.map(rgb => `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`));

      console.log(colorPalette);
    } catch (error) {
      console.error('Error extracting colors:', error);
      return [];
    }
  }

extractColors("https://pbs.twimg.com/profile_images/1841011343379288064/H4QWedNU_normal.jpg");