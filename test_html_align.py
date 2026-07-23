from bs4 import BeautifulSoup

html = '<p class="ql-align-center">Test center</p>'
soup = BeautifulSoup(html, 'html.parser')
print(str(soup))
