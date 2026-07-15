import fs from 'fs';

async function run() {
  const r1 = await fetch('https://play.google.com/store/apps/details?id=com.whatsapp.chatanalyzer');
  const t1 = await r1.text();
  const m1 = t1.match(/meta property="og:image" content="([^"]+)"/i);
  console.log('ChatStats:', m1 ? m1[1] : 'not found');
}

run();
