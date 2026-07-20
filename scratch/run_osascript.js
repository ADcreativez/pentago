try {
    var content = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError('/Users/macbookpro/ErwanzCode/Pentago copy/static/js/preview_builder.js', 4, null));
    eval(content);
    
    var p_json = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError('/Users/macbookpro/ErwanzCode/Pentago copy/scratch/p.json', 4, null));
    var f_json = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError('/Users/macbookpro/ErwanzCode/Pentago copy/scratch/f.json', 4, null));
    var p = JSON.parse(p_json);
    var findings = JSON.parse(f_json);
    
    var res = _buildPreviewDocument(p, findings, null, [], 'id', false, 1.4);
    if (res === undefined) {
        console.log("RESULT IS UNDEFINED!");
    } else {
        console.log("RESULT TYPE:", typeof res);
        console.log("RESULT LENGTH:", res.length);
    }
} catch(e) {
    console.log("ERROR:", e.toString());
}
