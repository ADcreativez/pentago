const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify')(new JSDOM('').window);

let t = '<p class="ql-align-center">Berikut adalah metodologi yang di gunakan</p>';

t = t.replace(/class=["']([^"']*)ql-align-center([^"']*)["']/g, 'class="$1 $2" style="text-align: center;"');
t = t.replace(/class=["']ql-align-center["']/g, 'style="text-align: center;"');

console.log("Before Purify:", t);
t = DOMPurify.sanitize(t, { ADD_ATTR: ['class', 'style'] });
console.log("After Purify:", t);
