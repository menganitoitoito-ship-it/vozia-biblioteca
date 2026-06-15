with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the auto-import logic to skip deleted books
old_import_logic = '''const existing = books.find(b => b.filename === item.filename);
        if (!existing) {'''

new_import_logic = '''const existing = books.find(b => b.filename === item.filename);
        const epubKey = item.filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();
        const deletedManifest = JSON.parse(localStorage.getItem('atk_deleted')||'[]');
        if (!existing && !deletedManifest.includes(epubKey)) {'''

content = content.replace(old_import_logic, new_import_logic)

# 2. Update deleteCurrentBook() to save the epubKey to 'atk_deleted'
old_delete = "idbDel('file_'+epubKey).catch(()=>{});"
new_delete = '''idbDel('file_'+epubKey).catch(()=>{});
  let deletedList = JSON.parse(localStorage.getItem('atk_deleted')||'[]');
  if(!deletedList.includes(epubKey)) {
    deletedList.push(epubKey);
    localStorage.setItem('atk_deleted', JSON.stringify(deletedList));
  }'''

content = content.replace(old_delete, new_delete)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Auto-import bug fixed.")
