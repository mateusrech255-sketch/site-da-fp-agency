const fs = require('fs');
const https = require('https');
const path = require('path');
const data = require('./src/data/videos.json');

const dir = path.join(__dirname, 'public', 'thumbnails');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed: ${res.statusCode}`));
      const file = fs.createWriteStream(filename);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function run() {
  for (const course of data.courses) {
    for (const video of course.videos) {
      if (video.thumbnail && video.thumbnail.startsWith('http')) {
        const ext = path.extname(new URL(video.thumbnail).pathname) || '.webp';
        const filename = `${video.id}${ext}`;
        const filepath = path.join(dir, filename);
        
        console.log(`Downloading ${video.id}...`);
        try {
          await download(video.thumbnail, filepath);
          video.thumbnail = `/thumbnails/${filename}`;
        } catch (e) {
          console.error(`Error downloading ${video.id}: ${e.message}`);
        }
      }
    }
  }
  
  fs.writeFileSync('./src/data/videos.json', JSON.stringify(data, null, 2));
  console.log("Done!");
}

run();
