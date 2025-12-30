const fs = require('fs');
const path = require('path');

// Emoji unicode ranges
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\uFE0F]|[\u2702-\u27B0]|[\u{1F191}-\u{1F251}]/gu;

let found = 0;
let totalFiles = 0;
let totalEmojis = 0;
const filesWithEmojis = [];

function scan(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') {
      scan(fullPath);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      totalFiles++;
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(emojiRegex);
      if (matches && matches.length > 0) {
        found++;
        totalEmojis += matches.length;
        const relativePath = fullPath.replace(process.cwd() + path.sep, '');
        filesWithEmojis.push({ path: relativePath, count: matches.length });
        console.log(`${relativePath} - ${matches.length} emoji(s)`);
      }
    }
  });
}

console.log('Scanning directories...\n');
['src', 'scripts', 'migrations', '_archive'].forEach(d => {
  console.log(`Checking: ${d}/`);
  scan(d);
});

console.log('\n=================================');
console.log('SCAN COMPLETE');
console.log('=================================');
console.log(`Total .js files scanned: ${totalFiles}`);
console.log(`Files with emojis: ${found}`);
console.log(`Total emojis found: ${totalEmojis}`);
console.log('=================================');
