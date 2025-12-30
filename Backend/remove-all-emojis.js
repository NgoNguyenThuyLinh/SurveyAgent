const fs = require('fs');
const path = require('path');

// All emoji patterns
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\uFE0F]|[\u2702-\u27B0]|[\u{1F191}-\u{1F251}]/gu;

let filesModified = 0;
let totalEmojisRemoved = 0;
const modifiedFiles = [];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') {
      processDirectory(fullPath);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      processFile(fullPath);
    }
  });
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(emojiRegex);
  
  if (matches && matches.length > 0) {
    const newContent = content.replace(emojiRegex, '');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    filesModified++;
    totalEmojisRemoved += matches.length;
    const relativePath = filePath.replace(process.cwd() + path.sep, '');
    modifiedFiles.push({ path: relativePath, count: matches.length });
    
    console.log(`[${filesModified}] ${relativePath} - Removed ${matches.length} emoji(s)`);
  }
}

console.log('====================================');
console.log('REMOVING EMOJIS FROM JS FILES');
console.log('====================================\n');

['src', 'scripts', 'migrations', '_archive'].forEach(dir => {
  console.log(`Processing: ${dir}/`);
  processDirectory(dir);
});

console.log('\n====================================');
console.log('FINAL REPORT');
console.log('====================================');
console.log(`Files modified: ${filesModified}`);
console.log(`Total emojis removed: ${totalEmojisRemoved}`);
console.log('====================================\n');

if (modifiedFiles.length > 0) {
  console.log('Files that were modified:');
  modifiedFiles.forEach(f => {
    console.log(`  - ${f.path} (${f.count} emojis)`);
  });
}

console.log('\n✓ Complete!');
