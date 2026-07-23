const marked = require('marked');
const html = `<table class="tbl"><thead><tr><th>No.</th></tr></thead><tbody><tr><td>1</td></tr><tr><td>2</td></tr></tbody></table>`;
console.log(marked.parse(html));
