with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix scroll on books-grid
content = content.replace(
    '#books-grid{display:grid;gap:16px;padding:20px 24px;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}',
    '#books-grid{display:grid;gap:16px;padding:20px 24px;grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); overflow-y:auto; flex:1; min-height:0;}'
)

# 2. Add "Añadir libro" button in topbar-right
topbar_right = '''<div class="topbar-right">
      <button class="btn-ghost" style="padding: 4px 10px; height: 28px; display:flex; align-items:center; font-size: 11px; margin-right: 8px;" onclick="document.getElementById('file-input').click()">+ Añadir</button>
      <span class="book-count" id="book-count"></span>'''

content = content.replace('<div class="topbar-right">\n      <span class="book-count" id="book-count"></span>', topbar_right)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes applied.")
