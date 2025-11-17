// Script to automatically add buildApiUrl import and replace all fetch calls
// Run this with: node fix-api-urls.js

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'api');

// Files to process
const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(apiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has buildApiUrl import
  if (content.includes('buildApiUrl')) {
    console.log(`✓ ${file} already updated`);
    return;
  }
  
  // Add import at the top
  content = `import { buildApiUrl } from '../config/api';\n\n` + content;
  
  // Replace all fetch("/api... patterns
  content = content.replace(/fetch\(\s*["'](\/api[^"']+)["']/g, 'fetch(buildApiUrl("$1")');
  content = content.replace(/fetch\(\s*`(\/api[^`]+)`/g, 'fetch(buildApiUrl(`$1`)');
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Updated ${file}`);
});

console.log('\n✅ All API files updated!');
