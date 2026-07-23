import sys
import os

try:
    import argostranslate.package
    import argostranslate.translate
except ImportError:
    print("argostranslate not installed")
    sys.exit(1)

print("Updating index...")
argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
package_to_install = next(filter(lambda x: x.from_code == 'id' and x.to_code == 'en', available_packages), None)

if package_to_install:
    print(f"Installing {package_to_install}...")
    argostranslate.package.install_from_path(package_to_install.download())
    print("Installed.")
else:
    print("ID to EN package not found.")
    sys.exit(1)

html_text = "<p>Halo <strong>dunia</strong>, ini adalah <em>tes</em> celah keamanan.</p>"
translated = argostranslate.translate.translate(html_text, 'id', 'en')
print("Original:", html_text)
print("Translated:", translated)
