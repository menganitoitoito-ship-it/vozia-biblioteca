with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

css_fixes = '''
.book-card {
  background: var(--s2);
  border: 1px solid var(--b1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all .2s cubic-bezier(.4,0,.2,1);
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  box-shadow: 4px 4px 10px rgba(0,0,0,0.5), inset -2px 0 5px rgba(0,0,0,0.2);
  border-left: 2px solid rgba(255,255,255,0.1);
  transform-origin: bottom center;
}
.book-card:hover {
  border-color: var(--b3);
  transform: translateY(-8px) rotateY(-5deg);
  box-shadow: 8px 12px 20px rgba(0,0,0,0.6), inset -2px 0 5px rgba(0,0,0,0.2);
}
.book-card .card-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  position: relative;
  overflow: hidden;
  background: var(--s3);
  flex-shrink: 0;
  border-radius: 2px 8px 0 0;
}
.book-card .card-info {
  padding: 10px 10px 12px;
  background: linear-gradient(to top, var(--s2), var(--s3));
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
'''

# We will just append this at the end of the <style> block so it overwrites any previous conflicting rules
content = content.replace('</style>', css_fixes + '\n</style>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS fixed.")
