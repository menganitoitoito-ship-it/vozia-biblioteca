import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add "Favoritos" to Sidebar
nav_favoritos = '''
    <div class="nav-item" onclick="showPanel('library','Favoritos');filterByFavorite()" id="nav-fav">
      <span class="ni-icon">❤️</span> Favoritos
    </div>'''
content = content.replace('<div class="nav-divider"></div>\n    <div class="nav-section">Voz</div>', f'{nav_favoritos}\n    <div class="nav-divider"></div>\n    <div class="nav-section">Voz</div>')

# 2. Add Favorite toggle to Modal
fav_btn = '<button class="btn-ghost" id="m-favorite" onclick="toggleFavorite()">🤍 Favorito</button>\n        <button class="btn-ghost" onclick="openInReader()">▶ Leer en voz alta</button>'
content = content.replace('<button class="btn-ghost" onclick="openInReader()">▶ Leer en voz alta</button>', fav_btn)

# 3. Add JS state logic for favorites and currentFilter
content = content.replace('let currentFilter = {status:null,catId:null,search:\'\'};', 'let currentFilter = {status:null,catId:null,search:\'\', favorite:false};')

js_favorite_func = '''
function filterByFavorite(){
  currentFilter.status=null;
  currentFilter.catId=null;
  currentFilter.favorite=true;
  document.getElementById('cat-header').style.display='none';
  renderBooks();
}

function toggleFavorite(){
  if(!currentModalBook) return;
  currentModalBook.favorite = !currentModalBook.favorite;
  document.getElementById('m-favorite').textContent = currentModalBook.favorite ? '❤️ Favorito' : '🤍 Favorito';
}
'''
content = content.replace('function filterByStatus(status){', js_favorite_func + '\nfunction filterByStatus(status){\n  currentFilter.favorite=false;')
content = content.replace('if(name===\'library\'&&!title){\n    currentFilter.status=null;\n    currentFilter.catId=null;', 'if(name===\'library\'&&!title){\n    currentFilter.status=null;\n    currentFilter.catId=null;\n    currentFilter.favorite=false;')
content = content.replace('if(currentFilter.status) filtered=filtered.filter(b=>b.status===currentFilter.status);', 'if(currentFilter.status) filtered=filtered.filter(b=>b.status===currentFilter.status);\n  if(currentFilter.favorite) filtered=filtered.filter(b=>b.favorite);')

# 4. Update the book modal open logic to reflect favorite status
content = content.replace("document.getElementById('m-title-input').value=book.title||'';", "document.getElementById('m-title-input').value=book.title||'';\n  document.getElementById('m-favorite').textContent = book.favorite ? '❤️ Favorito' : '🤍 Favorito';")

# 5. Heart icon on book card
card_html = '''<div class="card-status">${statusEmoji}</div>
        ${book.favorite ? '<div class="card-favorite" style="position:absolute;top:8px;left:8px;background:rgba(8,8,16,.7);backdrop-filter:blur(4px);border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;z-index:2">❤️</div>' : ''}
        <div class="card-progress"><div class="card-progress-fill" style="width:${progress}%"></div></div>'''
content = content.replace('<div class="card-status">${statusEmoji}</div>\n        <div class="card-progress"><div class="card-progress-fill" style="width:${progress}%"></div></div>', card_html)

# 6. Aesthetics: make the grid look like a real bookshelf, improve card visuals.
css_bookshelf = '''
/* ── ESTANTERIA AESTHETICS ── */
#books-grid[data-view="grid"] {
  background: url("data:image/svg+xml,%3Csvg width='100' height='220' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 210 L100 210 L100 220 L0 220 Z' fill='%23242438' /%3E%3Cpath d='M0 210 L100 210 L100 212 L0 212 Z' fill='%23141421' /%3E%3C/svg%3E");
  background-size: 100px 240px;
  padding-bottom: 40px;
  gap: 24px 16px;
}
.book-card {
  box-shadow: 4px 4px 10px rgba(0,0,0,0.5), inset -2px 0 5px rgba(0,0,0,0.2);
  border-left: 2px solid rgba(255,255,255,0.1);
  transform-origin: bottom center;
}
.book-card:hover {
  transform: translateY(-8px) rotateY(-5deg);
  box-shadow: 8px 12px 20px rgba(0,0,0,0.6), inset -2px 0 5px rgba(0,0,0,0.2);
}
.book-card .card-cover {
  border-radius: 2px 8px 8px 2px;
}
.book-card .card-info {
  background: linear-gradient(to top, var(--s2), var(--s3));
}
'''
content = content.replace('/* List view card */', css_bookshelf + '\n/* List view card */')

# 7. Add Auto-loading function in init()
auto_load_js = '''
  fetch('/epubs_manifest.json')
    .then(r => r.json())
    .then(async list => {
      let imported = 0;
      for (const item of list) {
        const existing = books.find(b => b.filename === item.filename);
        if (!existing) {
          try {
            const res = await fetch(item.url);
            const blob = await res.blob();
            const file = new File([blob], item.filename, {type: blob.type});
            await importFiles([file], true);
            imported++;
          } catch(e) { console.error("Error autoloading", item.filename, e); }
        }
      }
      if(imported > 0) {
        saveBooks();
        renderBooks();
        updateStats();
      }
    }).catch(e => console.log('No manifest found or error', e));
'''
content = content.replace('document.getElementById(\'synth-text\').addEventListener(\'input\',updateSynthCharCount);', 'document.getElementById(\'synth-text\').addEventListener(\'input\',updateSynthCharCount);\n' + auto_load_js)

# Need to update importFiles to handle silent imports without UI freezing/toast
content = content.replace('async function importFiles(files){', 'async function importFiles(files, silent=false){')
content = content.replace("prog.style.display='flex';", "if(!silent) prog.style.display='flex';")
content = content.replace("prog.style.display='none';", "if(!silent) prog.style.display='none';")
content = content.replace("if(imported) toast(`✅ ${imported} libro${imported!==1?'s':''} importado${imported!==1?'s':''}`);\n  else toast('ℹ️ Libros ya existían en tu biblioteca');", "if(!silent) { if(imported) toast(`✅ ${imported} libro${imported!==1?'s':''} importado${imported!==1?'s':''}`); else toast('ℹ️ Libros ya existían en tu biblioteca'); }")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html")
