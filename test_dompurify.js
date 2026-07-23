const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const purify = DOMPurify(window);
console.log(purify.sanitize('<p class="ql-align-center">Hello</p>'));
