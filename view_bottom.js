const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\HP\\.gemini\\antigravity\\brain\\1ad9fe0d-4a65-40dd-aaae-eb41dc0ea843\\preview.html', 'utf-8');

console.log('--- END OF PREVIEW.HTML ---');
console.log(content.substring(content.length - 1200));
