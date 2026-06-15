import os
import glob
import shutil
import json

# 1. Update saveBooks logic in index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

bad_save = '''function saveBooks(){
  try{localStorage.setItem('atk_books',JSON.stringify(books));}catch(e){
    // If storage full, try removing cover data from old books
    const slim=books.map(b=>({...b,coverData:b.coverData?.slice(0,100)?b.coverData:null}));
    localStorage.setItem('atk_books',JSON.stringify(slim));
  }
}'''

good_save = '''function saveBooks(){
  try{localStorage.setItem('atk_books',JSON.stringify(books));}catch(e){
    // If storage full, remove cover data completely to save space
    const slim=books.map(b=>({...b,coverData:null}));
    try {
      localStorage.setItem('atk_books',JSON.stringify(slim));
    } catch(e2) { console.error("Still full!", e2); }
  }
}'''

content = content.replace(bad_save, good_save)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Sync new EPUBs
source_dir = '/Users/fjramos8/EPUB/'
dest_dir = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs/'

new_files = [
    "La_mente_de_los_justos_Jonathan_Haidt.epub",
    "Los_enganos_de_la_mente_Sandra_Blakeslee.epub",
    "Una_nueva_Tierra_Eckhart_Tolle.epub",
    "El_error_de_Descartes_Antonio_Damasio.epub",
    "Dios_La_ciencia_Las_pruebas_MichelYves_Bollore.epub",
    "El_ego_es_el_enemigo_Ryan_Holiday.epub",
    "El_demonio_de_la_depresion_Andrew_Solomon.epub",
    "El_hombre_que_confundio_a_su_mujer_con_un_sombrero_Oliver_Sacks.epub",
    "Neurociencia_para_vencer_la_depresion_Alex_Korb.epub",
    "Incognito_David_Eagleman.epub"
]

for f in new_files:
    src_path = os.path.join(source_dir, f)
    dst_path = os.path.join(dest_dir, f)
    if os.path.exists(src_path) and not os.path.exists(dst_path):
        shutil.copy2(src_path, dst_path)

# 3. Re-generate manifest
manifest_path = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs_manifest.json'
all_epubs = glob.glob(os.path.join(dest_dir, '*.epub'))

manifest = []
for file_path in all_epubs:
    filename = os.path.basename(file_path)
    manifest.append({
        "filename": filename,
        "url": f"/epubs/{filename}"
    })

with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print("Bug fixed and epubs synced.")
