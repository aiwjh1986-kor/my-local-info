const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function listModels() {
  const KEY = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${KEY}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
listModels();
