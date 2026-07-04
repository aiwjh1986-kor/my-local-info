const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts/특별소식');
const todayPrefix = '2026-07-04';

// Regex to match most common emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

function removeEmojis(text) {
    // We will leave the '💡' emoji if it's used as a header icon, but remove others.
    // To be safe and simple, let's just remove specific emojis we know we added today.
    const emojisToRemove = ['🎉', '🚀', '💻', '✨', '🛡️', '⚽', '🔥', '🍁', '🇲🇦', '🇵🇾', '🇫🇷', '☕'];
    
    let newText = text;
    for (const emoji of emojisToRemove) {
        newText = newText.split(emoji).join('');
    }
    // Also clean up any double spaces that might result from removing emojis
    newText = newText.replace(/  +/g, ' ');
    return newText;
}

try {
    const files = fs.readdirSync(postsDir);
    let updatedCount = 0;
    
    for (const file of files) {
        if (file.startsWith(todayPrefix) && file.endsWith('.md')) {
            const filePath = path.join(postsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const newContent = removeEmojis(content);
            
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf-8');
                console.log(`Updated: ${file}`);
                updatedCount++;
            }
        }
    }
    console.log(`Successfully removed emojis from ${updatedCount} files.`);
} catch (error) {
    console.error('Error:', error);
}
