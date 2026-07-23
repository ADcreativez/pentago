t = '<p><img src="data:image/png;base64,..."></p><p class="ql-align-center">Berikut adalah metodologi yang di gunakan</p><p class="ql-align-center"><br></p><p class="ql-align-center">ok testing</p>'
isHtml = (t.startswith('<p') or t.startswith('<h') or t.startswith('<ul') or t.startswith('<ol') or
          t.startswith('<div') or t.startsWith('<strong') or t.startsWith('<em') or
          t.startsWith('<blockquote') or t.startsWith('<pre') or t.startsWith('<table') or t.startsWith('<span')) and '</' in t
print("isHtml:", isHtml)
