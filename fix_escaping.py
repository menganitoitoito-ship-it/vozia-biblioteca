import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the exportLibraryPage function body
match = re.search(r'(function exportLibraryPage\(\)\{.*?const html = `)(.*?)(`;\s*const blob)', content, flags=re.DOTALL)
if match:
    prefix = match.group(1)
    html_content = match.group(2)
    suffix = match.group(3)
    
    # We MUST escape </script> inside the string literal so the browser HTML parser doesn't terminate the main script!
    html_content = html_content.replace('</script>', '<\\/script>')
    
    new_content = content[:match.start(0)] + prefix + html_content + suffix + content[match.end(0):]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed </script> escaping in exportLibraryPage")
else:
    print("exportLibraryPage not found")
