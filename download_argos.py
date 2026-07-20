import argostranslate.package
import argostranslate.translate
print("Updating index...")
argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
print("Finding ID->EN package...")
package_to_install = next(
    filter(
        lambda x: x.from_code == 'id' and x.to_code == 'en', available_packages
    ), None
)
if package_to_install:
    print(f"Installing {package_to_install}...")
    argostranslate.package.install_from_path(package_to_install.download())
    print("Installed successfully.")
else:
    print("Package not found.")
