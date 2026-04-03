const fs = require('fs');
const path = require('path');

const files = [
  'package.json',
  'index.html',
  'src-tauri/tauri.conf.json',
  'src-tauri/src/main.rs',
  'src-tauri/Cargo.toml',
  'README.md',
  'README.zh.md'
];

for (const file of files) {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    // Case preserving replacements might be too risky, let's substitute specific casing
    content = content.replace(/Json2Board/g, 'UE5-GTG');
    content = content.replace(/json2board/g, 'ue5-gtg');
    content = content.replace(/j2b/g, 'gtg');
    fs.writeFileSync(p, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
