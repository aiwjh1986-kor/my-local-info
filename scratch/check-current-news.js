const rssUrl = `https://news.google.com/rss/search?q=%22%EC%9A%A9%EC%9D%B8%22%20%22%EC%A7%80%EB%B0%A9%EC%84%A0%EA%B1%B0%22%20when%3A1d&hl=ko&gl=KR&ceid=KR:ko`;

async function checkNews() {
  try {
    const response = await fetch(rssUrl);
    const text = await response.text();
    const itemRegex = /<title>([\s\S]*?)<\/title>/g;
    let match;
    console.log('--- Current News Titles ---');
    while ((match = itemRegex.exec(text)) !== null) {
      console.log(match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim());
    }
  } catch (error) {
    console.error(error);
  }
}

checkNews();
