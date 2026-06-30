const fs = require('fs');

async function test() {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://127.0.0.1:5001/api/report_templates', {
        headers: { 'Cookie': 'session=dummy' } // Need real session to avoid 401 maybe?
    });
    console.log(res.status);
}
test();
