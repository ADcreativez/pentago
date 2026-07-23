const fs = require('fs');

// Load the dictionary
eval(fs.readFileSync('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/dictionary-id-en.js', 'utf8'));

// Mock window and DOM environment
const window = { translateText: translateText };
const lang = 'en';

// Define tr manually or let preview_builder define it?
// Actually, let's just see if translateText works as expected
let text = `
<h2 class="sh-blue">Bab 1: Ringkasan Eksekutif</h2>
<p>Latar Belakang proyek ini adalah untuk melakukan Penetration Testing.</p>
`;
console.log("Original: " + text);
console.log("Translated: " + window.translateText(text, 'en'));

