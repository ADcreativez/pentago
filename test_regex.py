import re

t = '<p class="ql-align-center">Berikut adalah metodologi yang di gunakan</p>'

# Original regex in JS: t.replace(/class=["']([^"']*)ql-align-center([^"']*)["']/g, 'class="$1 $2" style="text-align: center;"')
# Let's write equivalent Python regex test
new_t = re.sub(r'class=["\']([^"\']*)ql-align-center([^"\']*)["\']', r'class="\1 \2" style="text-align: center;"', t)

print("Before:", t)
print("After:", new_t)
