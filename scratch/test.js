
function testStr() {
    var bigStr = "A".repeat(10 * 1024 * 1024); // 10MB string
    var html = `<!DOCTYPE html><html><body>${bigStr}</body></html>`;
    return html;
}

try {
    var res = testStr();
    if (res === undefined) {
        console.log("UNDEFINED");
    } else {
        console.log("STRING_LENGTH: " + res.length);
    }
} catch (e) {
    console.log("ERROR: " + e.toString());
}
