// Mock DOMPurify
const DOMPurify = {
    sanitize: (t, options) => {
        // Just return the string for mock, or we can use the real DOMPurify
        // Let's write what renderContent does
        return t;
    }
};

let t = '<p class="ql-align-center">Berikut adalah metodologi yang di gunakan</p>';

// The code from preview_builder.js
t = t.replace(/class=["']([^"']*)ql-align-center([^"']*)["']/g, 'class="$1 $2" style="text-align: center;"');
t = t.replace(/class=["']ql-align-center["']/g, 'style="text-align: center;"');

const isHtml = (t.startsWith('<p') || t.startsWith('<h') || t.startsWith('<ul') || t.startsWith('<ol') ||
                t.startsWith('<div') || t.startsWith('<strong') || t.startsWith('<em') ||
                t.startsWith('<blockquote') || t.startsWith('<pre') || t.startsWith('<table') || t.startsWith('<span')) && t.includes('</');
if (isHtml) {
    try { t = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(t, { ADD_ATTR: ['class', 'style'] }) : t; } catch(e) {}
}

console.log("Output:", t);
