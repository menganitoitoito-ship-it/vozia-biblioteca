import os
import zipfile
import tempfile
import shutil
import xml.etree.ElementTree as ET

epub_path = '/Users/fjramos8/Desktop/Proyectos/VOZIA+BIBLIOTECA/public/epubs/Ama tu soloedad.epub'
cover_path = '/Users/fjramos8/.gemini/antigravity/brain/5dfc06e6-8984-4dad-be2a-5c13ce4f2ba9/ama_tu_soledad_cover_1780904393280.png'

with tempfile.TemporaryDirectory() as tmpdir:
    with zipfile.ZipFile(epub_path, 'r') as zip_ref:
        zip_ref.extractall(tmpdir)
    
    container_xml = os.path.join(tmpdir, 'META-INF', 'container.xml')
    tree = ET.parse(container_xml)
    root = tree.getroot()
    ns = {'ns': 'urn:oasis:names:tc:opendocument:xmlns:container'}
    opf_rel_path = root.find('.//ns:rootfile', ns).attrib['full-path']
    opf_path = os.path.join(tmpdir, opf_rel_path)
    opf_dir = os.path.dirname(opf_path)
    
    shutil.copy(cover_path, os.path.join(opf_dir, 'new_cover.png'))
    
    ET.register_namespace('', 'http://www.idpf.org/2007/opf')
    ET.register_namespace('dc', 'http://purl.org/dc/elements/1.1/')
    
    opf_tree = ET.parse(opf_path)
    opf_root = opf_tree.getroot()
    
    metadata = opf_root.find('{http://www.idpf.org/2007/opf}metadata')
    manifest = opf_root.find('{http://www.idpf.org/2007/opf}manifest')
    
    # update author
    creator = metadata.find('{http://purl.org/dc/elements/1.1/}creator')
    if creator is not None:
        creator.text = 'Borja Vilaseca'
    else:
        new_creator = ET.SubElement(metadata, '{http://purl.org/dc/elements/1.1/}creator')
        new_creator.text = 'Borja Vilaseca'
        
    # check for existing cover meta
    for meta in metadata.findall('{http://www.idpf.org/2007/opf}meta'):
        if meta.attrib.get('name') == 'cover':
            metadata.remove(meta)
    
    new_meta = ET.SubElement(metadata, '{http://www.idpf.org/2007/opf}meta')
    new_meta.attrib['name'] = 'cover'
    new_meta.attrib['content'] = 'new_cover_id'
    
    new_item = ET.SubElement(manifest, '{http://www.idpf.org/2007/opf}item')
    new_item.attrib['id'] = 'new_cover_id'
    new_item.attrib['href'] = 'new_cover.png'
    new_item.attrib['media-type'] = 'image/png'
    
    opf_tree.write(opf_path, xml_declaration=True, encoding='utf-8')
    
    new_epub_path = epub_path + '.new'
    with zipfile.ZipFile(new_epub_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root_dir, dirs, files in os.walk(tmpdir):
            for file in files:
                abs_file = os.path.join(root_dir, file)
                rel_file = os.path.relpath(abs_file, tmpdir)
                if rel_file == 'mimetype':
                    zipf.write(abs_file, rel_file, compress_type=zipfile.ZIP_STORED)
                else:
                    zipf.write(abs_file, rel_file)
                    
    shutil.move(new_epub_path, epub_path)
    print("EPUB updated successfully.")
