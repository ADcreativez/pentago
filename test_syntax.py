import subprocess
try:
    # Use node to check syntax
    subprocess.run(["node", "-c", "static/js/app.js"], check=True, capture_output=True, text=True)
    print("Syntax OK")
except Exception as e:
    print("No node installed or failed")

