import weasyprint

html = """
<!DOCTYPE html>
<html>
<head>
<style>
@page {
    size: A4 portrait;
    margin: 0;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #fff; }
.page {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    background: #eee;
    border: 5px solid red; /* To see page boundaries */
}
.page-content {
    padding: 12mm 24mm !important;
    background: #fff;
    border: 5px solid blue; /* To see content boundaries */
}
</style>
</head>
<body>
    <div class="page">
        <div class="page-content">
            <h1>Test Weasyprint Margin</h1>
            <p>This is a test paragraph to see how Weasyprint renders width and margins.</p>
        </div>
    </div>
</body>
</html>
"""

weasyprint.HTML(string=html).write_pdf('test_margin.pdf')
print("Test PDF generated.")
