import os
from io import BytesIO

try:
    from weasyprint import HTML
    from PyPDF2 import PdfReader, PdfWriter
except ImportError as e:
    print("Import error:", e)
    exit(1)

html_content = "<html><body><h1>Hello World</h1></body></html>"
password = "TestPassword123!"

try:
    print("Generating PDF...")
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    print("Encrypting PDF...")
    input_pdf = PdfReader(BytesIO(pdf_bytes))
    output_pdf = PdfWriter()
    
    for page in input_pdf.pages:
        output_pdf.add_page(page)
        
    output_pdf.encrypt(password)
    
    out_io = BytesIO()
    output_pdf.write(out_io)
    out_io.seek(0)
    
    print("Success! Size:", len(out_io.getvalue()))
except Exception as e:
    print("Error:", e)
