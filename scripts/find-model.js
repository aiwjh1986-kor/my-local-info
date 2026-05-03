const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function findBestModel() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const models = data.models.map(m => m.name);
    
    console.log("사용 가능한 모델 목록:");
    models.forEach(name => {
      if (name.includes('flash') || name.includes('pro')) {
        console.log(`- ${name}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

findBestModel();
