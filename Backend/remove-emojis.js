const fs = require('fs');
const path = require('path');

// Danh sách emoji cần xóa
const emojiPattern = /[✅❌⚠️🤖💡🔧📝🎯⚡🚀📊📈🔍⏱📁🗑️⭐🔄💾🌐📤📥🔐👤🎨✓✗ℹ️🔌📍🔑📧📚]/g;

let filesModified = 0;
let totalEmojisRemoved = 0;
const modifiedFiles = [];

function processDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
            // Skip node_modules
            if (item.name === 'node_modules') continue;
            processDirectory(fullPath);
        } else if (item.isFile() && item.name.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(emojiPattern);
        
        if (matches && matches.length > 0) {
            const newContent = content.replace(emojiPattern, '');
            fs.writeFileSync(filePath, newContent, 'utf8');
            
            filesModified++;
            totalEmojisRemoved += matches.length;
            
            const relativePath = path.relative(process.cwd(), filePath);
            modifiedFiles.push({ path: relativePath, count: matches.length });
            
            console.log(`[${filesModified}] ${relativePath} - Removed ${matches.length} emoji(s)`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
    }
}

// Xử lý các thư mục cần thiết
const directories = [
    path.join(__dirname, 'src'),
    path.join(__dirname, 'scripts'),
    path.join(__dirname, 'migrations'),
    path.join(__dirname, '_archive')
];

console.log('====================================');
console.log('Removing emojis from JavaScript files');
console.log('====================================\n');

for (const dir of directories) {
    if (fs.existsSync(dir)) {
        console.log(`Processing: ${path.basename(dir)}/`);
        processDirectory(dir);
    }
}

console.log('\n====================================');
console.log('SUMMARY REPORT');
console.log('====================================');
console.log(`Files modified: ${filesModified}`);
console.log(`Total emojis removed: ${totalEmojisRemoved}`);
console.log('====================================\n');

if (modifiedFiles.length > 0) {
    console.log('Modified files:');
    modifiedFiles.forEach(f => {
        console.log(`  - ${f.path} (${f.count} emojis)`);
    });
}

console.log('\nDone!');
