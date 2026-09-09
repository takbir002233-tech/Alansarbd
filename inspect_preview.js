const fs = require('fs');
const path = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\1ad9fe0d-4a65-40dd-aaae-eb41dc0ea843\\preview.html';

const content = fs.readFileSync(path, 'utf-8');

console.log('File length:', content.length);
console.log('Has qard:', content.includes('qard'));
console.log('Has loyalt:', content.includes('loyalt'));
console.log('Has VIP:', content.includes('VIP'));
console.log('Has modal:', content.includes('modal'));

const matches = content.match(/id="[^"]+"/g) || [];
console.log('IDs found:', matches.slice(0, 30));
