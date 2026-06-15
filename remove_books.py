import os
import json

manifest_path = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs_manifest.json'
epubs_dir = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs/'

to_remove = [
    "El_alquimista_Paulo_Coelho.epub",
    "Por_si_las_voces_vuelven_Angel_Martin.epub",
    "Temario_N8N_100_Paginas_Completo.epub",
    "Temario_Automatizacion_Acelerado.epub"
]

with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

new_manifest = [item for item in manifest if item['filename'] not in to_remove]

with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(new_manifest, f, ensure_ascii=False, indent=2)

for f in to_remove:
    path = os.path.join(epubs_dir, f)
    if os.path.exists(path):
        os.remove(path)

print("Files removed and manifest updated.")
