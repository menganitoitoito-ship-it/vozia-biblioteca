import os
import shutil
import json
import glob

sources = [
    '/Users/fjramos8/Documents/Descargas/*.epub',
    '/Users/fjramos8/EPUB/*.epub'
]

dest_dir = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs'
manifest_path = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs_manifest.json'

os.makedirs(dest_dir, exist_ok=True)

manifest = []

for pattern in sources:
    for file_path in glob.glob(pattern):
        filename = os.path.basename(file_path)
        dest_path = os.path.join(dest_dir, filename)
        if not os.path.exists(dest_path):
            shutil.copy2(file_path, dest_path)
        
        manifest.append({
            "filename": filename,
            "url": f"/epubs/{filename}"
        })

with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Imported {len(manifest)} epubs and created manifest.")
