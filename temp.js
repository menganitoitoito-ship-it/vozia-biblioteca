<script>
// ═══════════════════════════════════════════
//  PROVIDERS CONFIG
// ═══════════════════════════════════════════
const PROVIDERS = {
  webspeech:{name:'Web Speech',emoji:'🌐',color:'#3dd68c',free:'Gratis · Sin key',
    info:'<b>100% gratis, sin registro.</b> Usa las voces del navegador. Funciona bien en Chrome/Edge/Safari con voces en español instaladas.',
    keyPlaceholder:'(no necesita API key)',keyLink:'✅ Sin registro — funciona ya',keyLinkUrl:'#',
    noKeyRequired:true,voicesSource:'webspeech',
    models:[{id:'1',name:'Normal'},{id:'1.25',name:'Rápido'},{id:'1.5',name:'Muy rápido'},{id:'0.75',name:'Lento'}]},
  elevenlabs:{name:'ElevenLabs',emoji:'🎙️',color:'#c084fc',free:'10.000 chars/mes gratis',
    info:'10.000 chars/mes gratis. Clonación de voz, modelos premium. <a href="https://elevenlabs.io" target="_blank" style="color:var(--gold)">elevenlabs.io</a> → Profile → API Keys.',
    keyPlaceholder:'sk_...',keyLink:'🔗 elevenlabs.io → API Keys',keyLinkUrl:'https://elevenlabs.io',
    voicesSource:'api',
    models:[{id:'eleven_multilingual_v2',name:'Multilingual v2'},{id:'eleven_flash_v2_5',name:'Flash v2.5'},{id:'eleven_turbo_v2_5',name:'Turbo v2.5'}]},
  openai:{name:'OpenAI TTS',emoji:'✨',color:'#60a5fa',free:'$0.015 / 1K chars',
    info:'Excelente calidad, detecta idioma automáticamente. $0.015/1000 chars. <a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--gold)">platform.openai.com</a> → API Keys.',
    keyPlaceholder:'sk-...',keyLink:'🔗 platform.openai.com → API Keys',keyLinkUrl:'https://platform.openai.com/api-keys',
    voicesSource:'static',
    staticVoices:[
      {voice_id:'nova',name:'Nova 🌍',labels:{gender:'female',lang:'multi',accent:'multilingüe'}},
      {voice_id:'shimmer',name:'Shimmer 🌍',labels:{gender:'female',lang:'multi',accent:'multilingüe'}},
      {voice_id:'alloy',name:'Alloy 🌍',labels:{gender:'neutral',lang:'multi',accent:'multilingüe'}},
      {voice_id:'echo',name:'Echo 🌍',labels:{gender:'male',lang:'multi',accent:'multilingüe'}},
      {voice_id:'fable',name:'Fable 🌍',labels:{gender:'male',lang:'multi',accent:'british'}},
      {voice_id:'onyx',name:'Onyx 🌍',labels:{gender:'male',lang:'multi',accent:'multilingüe'}}
    ],
    models:[{id:'tts-1-hd',name:'TTS-1 HD (mejor)'},{id:'tts-1',name:'TTS-1 (rápido)'}]},
  unrealspeech:{name:'Unreal Speech',emoji:'🚀',color:'#3dd68c',free:'250.000 chars/mes gratis',
    info:'<b>250k chars/mes GRATIS</b>. ⚠️ Solo Mateo habla español. <a href="https://unrealspeech.com" target="_blank" style="color:var(--gold)">unrealspeech.com</a> → Sign Up → API Keys.',
    keyPlaceholder:'Tu API key de Unreal Speech',keyLink:'🔗 unrealspeech.com → API Keys',keyLinkUrl:'https://unrealspeech.com',
    voicesSource:'static',
    staticVoices:[
      {voice_id:'Mateo',name:'Mateo 🇪🇸',labels:{gender:'male',lang:'es',accent:'español'}},
      {voice_id:'Charlotte',name:'Charlotte 🇺🇸',labels:{gender:'female',lang:'en',accent:'american'}},
      {voice_id:'Rowan',name:'Rowan 🇺🇸',labels:{gender:'female',lang:'en',accent:'american'}},
      {voice_id:'Ethan',name:'Ethan 🇺🇸',labels:{gender:'male',lang:'en',accent:'american'}},
      {voice_id:'Arthur',name:'Arthur 🇬🇧',labels:{gender:'male',lang:'en',accent:'british'}}
    ],
    models:[{id:'Sierra',name:'Sierra (mejor)'},{id:'Canyon',name:'Canyon'},{id:'Breeze',name:'Breeze (rápido)'}]},
  playht:{name:'PlayHT',emoji:'🎭',color:'#f59e0b',free:'12.500 chars/mes gratis',
    info:'12.500 chars/mes gratis. +900 voces. Requiere User ID + API Key. <a href="https://play.ht" target="_blank" style="color:var(--gold)">play.ht</a> → API Access.',
    keyPlaceholder:'API Secret Key',extraField:true,extraPlaceholder:'User ID (de play.ht → API Access)',
    keyLink:'🔗 play.ht → API Access',keyLinkUrl:'https://play.ht',
    voicesSource:'static',
    staticVoices:[
      {voice_id:'s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',name:'Valentina',labels:{gender:'female',accent:'spanish'}},
      {voice_id:'s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json',name:'Mateo',labels:{gender:'male',accent:'spanish'}}
    ],
    models:[{id:'PlayHT2.0-turbo',name:'PlayHT 2.0 Turbo'},{id:'Play3.0-mini',name:'Play 3.0 Mini'}]}
};

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════
let books = JSON.parse(localStorage.getItem('atk_books')||'[]');
let categories = JSON.parse(localStorage.getItem('atk_cats')||'[]');
let currentFilter = {status:null,catId:null,search:'', favorite:false};
let currentView = localStorage.getItem('atk_view')||'grid';
let currentModalBook = null;

// Voice/TTS state
let currentProvider = localStorage.getItem('voz_provider')||'webspeech';
let apiKeys = JSON.parse(localStorage.getItem('voz_apikeys')||'{}');
let apiKey = apiKeys[currentProvider]||'';
let voices = [];
let selectedVoiceId = localStorage.getItem('voz_selected')||'';
let selectedProviderInModal = currentProvider;

// Reader/player state
let epubChapters = [];
let currentChapter = 0;
let currentEpubKey = '';
let currentEpubBookId = null;
let audioElements = {};
let currentAudioId = null;
let miniPlayerAudio = null;
let speedSteps = [0.75,1,1.25,1.5,2];
let speedIdx = 1;

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
function init(){
  // Migrate old data
  if(!apiKeys.elevenlabs && localStorage.getItem('voz_apikey'))
    apiKeys.elevenlabs = localStorage.getItem('voz_apikey');

  // Default categories if empty
  if(!categories.length){
    categories = [
      {id:'cat_1',name:'Psicología',color:'#6366f1'},
      {id:'cat_2',name:'Filosofía',color:'#f59e0b'},
      {id:'cat_3',name:'Finanzas',color:'#10b981'},
      {id:'cat_4',name:'Ciencia Ficción',color:'#c084fc'},
      {id:'cat_5',name:'Historia',color:'#f97316'},
      {id:'cat_6',name:'Autoayuda',color:'#06b6d4'},
      {id:'cat_7',name:'Ciencia',color:'#60a5fa'},
      {id:'cat_8',name:'Novela',color:'#ec4899'}
    ];
    saveCategories();
  }

  setView(currentView,false);
  renderSidebar();
  renderBooks();
  // Load covers from IDB asynchronously (covers are not stored in localStorage)
  loadCoversFromIDB();
  updateStats();
  updateApiStatus();
  loadVoicesForProvider();
  setupSearch();
  setupDrop();
  setupStars();
  setupColorPicker();
  setupMediaSession();

  document.getElementById('file-input').addEventListener('change',e=>{
    importFiles(Array.from(e.target.files));
    e.target.value='';
  });
  document.getElementById('synth-text').addEventListener('input',updateSynthCharCount);

  fetch('/epubs_manifest.json')
    .then(r => r.json())
    .then(async list => {
      let imported = 0;
      let coversFixed = 0;
      for (const item of list) {
        const existing = books.find(b => b.filename === item.filename);
        const epubKey = item.filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();
        const deletedManifest = JSON.parse(localStorage.getItem('atk_deleted')||'[]');
        if (deletedManifest.includes(epubKey)) continue;

        if (!existing) {
          // New book: import fully
          try {
            const res = await fetch(item.url);
            const blob = await res.blob();
            const file = new File([blob], item.filename, {type: blob.type});
            await importFiles([file], true);
            imported++;
          } catch(e) { console.error("Error autoloading", item.filename, e); }
        } else {
          // Existing book: check if cover is missing in IDB
          const coverKey = 'cover_' + epubKey;
          const hasCover = await idbGet(coverKey).catch(()=>null);
          if (!hasCover && !existing.coverData) {
            // Re-fetch just to extract cover
            try {
              const res = await fetch(item.url);
              const buf = await res.arrayBuffer();
              const meta = await extractBookMetaFromBuffer(item.filename, buf);
              if (meta.coverData) {
                existing.coverData = meta.coverData;
                // extractBookMetaFromBuffer already saved to IDB
                coversFixed++;
              }
            } catch(e) { console.warn("Error re-fetching cover for", item.filename, e); }
          }
        }
      }
      if(imported > 0 || coversFixed > 0) {
        if(imported > 0) saveBooks();
        renderBooks();
        updateStats();
      }
    }).catch(e => console.log('No manifest found or error', e));

}

// ═══════════════════════════════════════════
//  PANEL NAVIGATION
// ═══════════════════════════════════════════
function showPanel(name, title=''){
  document.querySelectorAll('.content-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const panel = document.getElementById('panel-'+name);
  if(panel) panel.classList.add('active');
  const nav = document.getElementById('nav-'+name);
  if(nav) nav.classList.add('active');
  document.getElementById('topbar-title').textContent = title || name;
  closeSidebar();
  // Reset library filter when showing library
  if(name==='library'&&!title){
    currentFilter.status=null;
    currentFilter.catId=null;
    currentFilter.favorite=false;
    document.getElementById('cat-header').style.display='none';
    renderBooks();
  }
}

function showCategoryPanel(catId){
  const cat = categories.find(c=>c.id===catId);
  if(!cat) return;
  showPanel('library',cat.name);
  currentFilter.status=null;
  currentFilter.catId=catId;
  const header = document.getElementById('cat-header');
  header.style.display='flex';
  document.getElementById('cat-header-dot').style.background=cat.color;
  document.getElementById('cat-header-title').textContent=cat.name;
  renderBooks();
  const count = books.filter(b=>b.catId===catId).length;
  document.getElementById('cat-header-count').textContent=count+' libro'+(count!==1?'s':'');
}

// ═══════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════
function renderSidebar(){
  const list = document.getElementById('category-list');
  list.innerHTML = categories.map(cat=>{
    const count = books.filter(b=>b.catId===cat.id).length;
    return `<div class="nav-item" onclick="showCategoryPanel('${cat.id}')" id="nav-cat-${cat.id}">
      <span class="ni-icon" style="color:${cat.color};font-size:10px">●</span>
      ${cat.name}
      <span class="ni-badge">${count}</span>
    </div>`;
  }).join('');
}

function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('visible');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

// ═══════════════════════════════════════════
//  BOOK RENDERING
// ═══════════════════════════════════════════
function filterBooks(){
  let filtered = [...books];
  if(currentFilter.status) filtered=filtered.filter(b=>b.status===currentFilter.status);
  if(currentFilter.favorite) filtered=filtered.filter(b=>b.favorite);
  if(currentFilter.catId) filtered=filtered.filter(b=>b.catId===currentFilter.catId);
  if(currentFilter.search){
    const q=currentFilter.search.toLowerCase();
    filtered=filtered.filter(b=>(b.title||'').toLowerCase().includes(q)||(b.author||'').toLowerCase().includes(q));
  }
  return filtered;
}


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

function filterByStatus(status){
  currentFilter.favorite=false;
  currentFilter.status=status;
  currentFilter.catId=null;
  document.getElementById('cat-header').style.display='none';
  renderBooks();
}

function renderBooks(){
  const grid = document.getElementById('books-grid');
  const empty = document.getElementById('empty-state');
  const filtered = filterBooks();
  const count = filtered.length;
  document.getElementById('book-count').textContent = count ? count+' libro'+(count!==1?'s':'') : '';

  if(!count){
    grid.innerHTML='';
    empty.style.display='flex';
    return;
  }
  empty.style.display='none';

  grid.innerHTML = filtered.map(book=>{
    const cat = categories.find(c=>c.id===book.catId);
    const bgColor = cat ? cat.color+'22' : '#1c1c2e';
    const textColor = cat ? cat.color : '#4e4a68';
    const statusEmoji = {unread:'📋',reading:'📖',read:'✅'}[book.status]||'📋';
    const progress = getBookProgress(book);
    const isPlaying = currentEpubBookId===book.id && miniPlayerAudio && !miniPlayerAudio.paused;

    let coverHtml;
    if(book.coverData){
      coverHtml=`<img src="${book.coverData}" alt="" loading="lazy">`;
    } else {
      const initial = (book.title||'?')[0].toUpperCase();
      coverHtml=`<div class="card-cover-ph" style="background:${bgColor}"><div class="card-ph-initial" style="color:${textColor}">${initial}</div></div>`;
    }

    return `<div class="book-card ${isPlaying?'is-playing':''}" onclick="openBookModal('${book.id}')" data-id="${book.id}">
      <div class="card-cover">
        ${coverHtml}
        <div class="card-playing">▶</div>
        <div class="card-status">${statusEmoji}</div>
        ${book.favorite ? '<div class="card-favorite" style="position:absolute;top:8px;left:8px;background:rgba(8,8,16,.7);backdrop-filter:blur(4px);border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;z-index:2">❤️</div>' : ''}
        <div class="card-progress"><div class="card-progress-fill" style="width:${progress}%"></div></div>
      </div>
      <div class="card-info">
        <div class="card-title">${escHtml(book.title||'Sin título')}</div>
        <div class="card-author">${escHtml(book.author||'Autor desconocido')}</div>
      </div>
    </div>`;
  }).join('');
}

function getBookProgress(book){
  if(!book.epubKey) return 0;
  const ch = parseInt(localStorage.getItem('atk_ch_'+book.epubKey)||'0');
  const total = parseInt(localStorage.getItem('atk_chtotal_'+book.epubKey)||'0');
  if(!total) return 0;
  return Math.round((ch/total)*100);
}

function updateStats(){
  const total = books.length;
  const read = books.filter(b=>b.status==='read').length;
  const reading = books.filter(b=>b.status==='reading').length;
  document.getElementById('stat-total').textContent=total;
  document.getElementById('stat-read').textContent=read;
  document.getElementById('stat-reading').textContent=reading;
  document.getElementById('badge-total').textContent=total;
  document.getElementById('badge-reading').textContent=reading;
  renderSidebar();
}

// ═══════════════════════════════════════════
//  IMPORT
// ═══════════════════════════════════════════
function setupDrop(){
  const body = document.body;
  const overlay = document.getElementById('drop-overlay');
  let dragCounter = 0;
  body.addEventListener('dragenter',e=>{
    e.preventDefault();
    dragCounter++;
    overlay.classList.add('visible');
  });
  body.addEventListener('dragleave',e=>{
    dragCounter--;
    if(dragCounter<=0){dragCounter=0;overlay.classList.remove('visible');}
  });
  body.addEventListener('dragover',e=>e.preventDefault());
  body.addEventListener('drop',e=>{
    e.preventDefault();
    dragCounter=0;
    overlay.classList.remove('visible');
    const files = Array.from(e.dataTransfer.files).filter(f=>
      /\.(epub|pdf|txt|docx|html?|md)$/i.test(f.name));
    if(files.length) importFiles(files);
  });
}

async function importFiles(files, silent=false){
  const prog = document.getElementById('import-progress');
  const msg = document.getElementById('progress-msg');
  if(!silent) prog.style.display='flex';
  let imported=0;
  for(const file of files){
    msg.textContent=`Importando ${file.name}…`;
    try{
      // Read buffer ONCE — File streams can only be read once in some browsers
      const buf = await file.arrayBuffer();
      // Pass a copy to meta extractor (slice creates a copy without transferring)
      const book = await extractBookMetaFromBuffer(file.name, buf.slice(0));
      const existing = books.find(b=>b.filename===file.name);
      if(!existing){
        books.push(book);
        imported++;
      } else {
        // Update existing book's epubKey/cover if it was missing
        const ex = existing;
        if(!ex.epubKey && book.epubKey) ex.epubKey = book.epubKey;
        if(!ex.coverData && book.coverData) ex.coverData = book.coverData;
        if(!ex.catId && book.catId) ex.catId = book.catId;
      }
      // Store original buf in IDB (use another slice to keep original intact)
      const epubKey = book.epubKey || file.name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
      await idbSet('file_'+epubKey, {buf: buf.slice(0), name:file.name, type:file.type||''});
    }catch(e){
      console.warn('Error importando',file.name,e);
    }
  }
  saveBooks();
  renderBooks();
  updateStats();
  if(!silent) prog.style.display='none';
  if(!silent) { if(imported) toast(`✅ ${imported} libro${imported!==1?'s':''} importado${imported!==1?'s':''}`); else toast('ℹ️ Libros ya existían en tu biblioteca'); }
}

// Keep old name as alias so any other callers don't break
async function extractBookMeta(file){
  const buf = await file.arrayBuffer();
  return extractBookMetaFromBuffer(file.name, buf);
}

async function extractBookMetaFromBuffer(name, buf){
  const id = 'book_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
  const base = {
    id, filename:name, added:new Date().toISOString(),
    status:'unread', rating:0, notes:'', catId:null,
    title:name.replace(/\.[^.]+$/,'').replace(/[_-]/g,' '),
    author:'', publisher:'', lang:'', desc:'', coverData:null, epubKey:null
  };

  const nameLower = name.toLowerCase();
  if(nameLower.endsWith('.epub')){
    try{
      await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      const zip = await JSZip.loadAsync(buf);
      const cont = zip.file('META-INF/container.xml');
      if(cont){
        const contText = await cont.async('text');
        const opfPath = contText.match(/full-path="([^"]+)"/)?.[1];
        if(opfPath){
          const opfText = await zip.file(opfPath).async('text');
          const opf = new DOMParser().parseFromString(opfText,'text/xml');
          const ns='http://purl.org/dc/elements/1.1/';
          base.title = opf.getElementsByTagNameNS(ns,'title')[0]?.textContent?.trim()||base.title;
          base.author = opf.getElementsByTagNameNS(ns,'creator')[0]?.textContent?.trim()||'';
          base.publisher = opf.getElementsByTagNameNS(ns,'publisher')[0]?.textContent?.trim()||'';
          base.lang = opf.getElementsByTagNameNS(ns,'language')[0]?.textContent?.trim()||'';
          base.desc = opf.getElementsByTagNameNS(ns,'description')[0]?.textContent?.trim()||'';
          // Read dc:subject for auto-category matching
          const subjects = [...opf.getElementsByTagNameNS(ns,'subject')].map(s=>s.textContent?.trim()||'').filter(Boolean);
          base.catId = autoDetectCategory(subjects, base.title, base.desc);
          // Cover
          const opfDir = opfPath.includes('/')?opfPath.substring(0,opfPath.lastIndexOf('/')+1):'';
          const manifest={};
          opf.querySelectorAll('manifest item').forEach(item=>{
            manifest[item.getAttribute('id')]={href:item.getAttribute('href'),type:item.getAttribute('media-type')||''};
          });
          let coverId = opf.querySelector('meta[name="cover"]')?.getAttribute('content');
          let coverItem = coverId?manifest[coverId]:null;
          if(!coverItem){
            coverItem = Object.values(manifest).find(m=>m.type.startsWith('image/')&&/cover/i.test(m.href));
          }
          if(coverItem){
            const coverFile = zip.file(opfDir+coverItem.href)||zip.file(coverItem.href);
            if(coverFile){
              const blob = await coverFile.async('blob');
              const dataUrl = await blobToDataURL(blob);
              base.coverData = dataUrl;
              // Persist cover in IDB so it survives localStorage size limits
              const coverKey = 'cover_'+(name.replace(/[^a-z0-9]/gi,'_').toLowerCase());
              idbSet(coverKey, dataUrl).catch(()=>{});
            }
          }
        }
      }
      base.epubKey = name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
    }catch(e){ console.warn('EPUB meta error',e); }
  } else {
    base.epubKey = name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
  }
  return base;
}

// Auto-detect category from EPUB subjects/title/description
function autoDetectCategory(subjects, title, desc){
  const haystack = [...subjects, title, desc].join(' ').toLowerCase();
  // Map keywords → category names (must match categories array)
  const rules = [
    {keys:['psicolog','psych','mental','mente','emocio','terapia','ansiedad','trauma'],cat:'Psicología'},
    {keys:['filosof','philos','ética','etica','moral','existenci','platón','nietzsche','kant','aristotel'],cat:'Filosofía'},
    {keys:['finanz','finan','invers','bolsa','dinero','money','econom','trading','mercado','capital','riqueza'],cat:'Finanzas'},
    {keys:['ciencia ficción','sci-fi','scifi','science fiction','robot','galaxia','espacial','distop','futur','android','alien'],cat:'Ciencia Ficción'},
    {keys:['histori','historic','guerra','siglo','imperio','revolución','mediev','ancient','antigü'],cat:'Historia'},
    {keys:['autoayuda','auto-ayuda','self-help','motivaci','éxito','exito','habit','hábito','liderazgo','superacion'],cat:'Autoayuda'},
    {keys:['ciencia','biolog','física','quimic','astronom','neurocien','evoluci','cosmos','nature','natur'],cat:'Ciencia'},
    {keys:['novel','fiction','romance','amor','aventura','misterio','thriller','crimen','detectiv','fantasia','fantasía'],cat:'Novela'},
  ];
  for(const rule of rules){
    if(rule.keys.some(k=>haystack.includes(k))){
      const cat = categories.find(c=>c.name===rule.cat);
      if(cat) return cat.id;
    }
  }
  return null;
}

function blobToDataURL(blob){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result);
    r.onerror=rej;
    r.readAsDataURL(blob);
  });
}

// ═══════════════════════════════════════════
//  BOOK MODAL
// ═══════════════════════════════════════════
function openBookModal(bookId){
  const book = books.find(b=>b.id===bookId);
  if(!book) return;
  currentModalBook = book;

  // Cover
  const img = document.getElementById('m-cover-img');
  const ph = document.getElementById('m-cover-placeholder');
  if(book.coverData){
    img.src=book.coverData; img.style.display='block'; ph.style.display='none';
  } else {
    img.style.display='none';
    const cat=categories.find(c=>c.id===book.catId);
    ph.style.background=cat?cat.color+'22':'#1c1c2e';
    ph.style.color=cat?cat.color:'#4e4a68';
    ph.style.display='flex';
    document.getElementById('m-initial').textContent=(book.title||'?')[0].toUpperCase();
  }

  document.getElementById('m-title-display').textContent=book.title||'Sin título';
  document.getElementById('m-author-display').textContent=book.author||'Autor desconocido';
  document.getElementById('m-status').value=book.status||'unread';
  document.getElementById('m-publisher').textContent=book.publisher||'—';
  document.getElementById('m-lang').textContent=book.lang||'—';
  document.getElementById('m-added').textContent=book.added?new Date(book.added).toLocaleDateString('es-ES'):'—';
  document.getElementById('m-desc').textContent=book.desc||'Sin sinopsis disponible.';
  document.getElementById('m-title-input').value=book.title||'';
  document.getElementById('m-favorite').textContent = book.favorite ? '❤️ Favorito' : '🤍 Favorito';
  document.getElementById('m-author-input').value=book.author||'';
  document.getElementById('m-notes').value=book.notes||'';

  // Last listen
  const lastCh = book.epubKey?localStorage.getItem('atk_ch_'+book.epubKey):null;
  const totalCh = book.epubKey?localStorage.getItem('atk_chtotal_'+book.epubKey):null;
  document.getElementById('m-last-listen').textContent=
    lastCh&&totalCh?`Capítulo ${parseInt(lastCh)+1} de ${totalCh}`:'Sin actividad';

  // Category badge
  const cat=categories.find(c=>c.id===book.catId);
  const badge=document.getElementById('m-cat-badge');
  badge.textContent=cat?cat.name:'Sin categoría';
  badge.style.background=cat?cat.color+'22':'';
  badge.style.color=cat?cat.color:'var(--t3)';
  badge.style.borderColor=cat?cat.color+'44':'';

  // Category select
  const catSel=document.getElementById('m-category');
  catSel.innerHTML='<option value="">Sin categoría</option>'+
    categories.map(c=>`<option value="${c.id}" ${book.catId===c.id?'selected':''}>${c.name}</option>`).join('');

  updateStars(book.rating||0);
  switchTab(document.querySelector('.m-tab.active'),'edit');
  document.getElementById('book-overlay').classList.add('visible');
}

function closeBookModal(e){
  if(e&&e.target!==document.getElementById('book-overlay')) return;
  document.getElementById('book-overlay').classList.remove('visible');
  currentModalBook=null;
}

function saveBookModal(){
  if(!currentModalBook) return;
  const book=currentModalBook;
  book.title=document.getElementById('m-title-input').value.trim()||book.title;
  book.author=document.getElementById('m-author-input').value.trim();
  book.notes=document.getElementById('m-notes').value;
  book.status=document.getElementById('m-status').value;
  book.catId=document.getElementById('m-category').value||null;
  const litStars=document.querySelectorAll('.star.lit');
  const rating=litStars.length?parseInt([...litStars].at(-1).dataset.v||'0'):0;
  book.rating=rating;
  saveBooks();
  renderBooks();
  updateStats();
  document.getElementById('book-overlay').classList.remove('visible');
  toast('✅ Libro guardado');
}

function onStatusChange(){
  // live-update status emoji shown in modal
}

function deleteCurrentBook(){
  if(!currentModalBook) return;
  if(!confirm('¿Eliminar este libro de tu biblioteca?')) return;
  const epubKey=currentModalBook.epubKey||currentModalBook.filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();
  idbDel('file_'+epubKey).catch(()=>{});
  let deletedList = JSON.parse(localStorage.getItem('atk_deleted')||'[]');
  if(!deletedList.includes(epubKey)) {
    deletedList.push(epubKey);
    localStorage.setItem('atk_deleted', JSON.stringify(deletedList));
  }
  books=books.filter(b=>b.id!==currentModalBook.id);
  saveBooks();
  renderBooks();
  updateStats();
  document.getElementById('book-overlay').classList.remove('visible');
  toast('🗑 Libro eliminado');
  currentModalBook=null;
}

async function openInReader(){
  if(!currentModalBook) return;
  const book=currentModalBook;
  document.getElementById('book-overlay').classList.remove('visible');
  showPanel('reader','Lector de voz');

  const epubKey=book.epubKey||book.filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();

  // Show loading in reader area
  document.getElementById('reader-text').innerHTML=
    '<div class="empty-state"><div class="progress-spinner" style="width:36px;height:36px"></div><p style="margin-top:12px;color:var(--t2)">Cargando libro…</p></div>';

  try{
    const stored=await idbGet('file_'+epubKey);
    if(stored && stored.buf && stored.buf.byteLength > 0){
      const fname = book.filename || stored.name;
      await openDocumentFromBuffer(fname, stored.buf.slice(0), null);
      return;
    } else {
      // IDB has no data — could be first time or was cleared
      toast('📂 Archivo no disponible en caché — selecciónalo para cargarlo');
      document.getElementById('epub-file').click();
    }
  }catch(e){
    console.warn('IDB load error',e);
    toast('📂 Error leyendo caché — selecciona el archivo manualmente');
    document.getElementById('epub-file').click();
  }
}

function switchTab(btn,tabId){
  document.querySelectorAll('.m-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  if(typeof btn==='string'){
    document.querySelector(`.m-tab[data-tab="${btn}"]`)?.classList.add('active');
    document.getElementById('tab-'+btn)?.classList.add('active');
  } else {
    btn.classList.add('active');
    document.getElementById('tab-'+tabId)?.classList.add('active');
  }
}

// ═══════════════════════════════════════════
//  STARS
// ═══════════════════════════════════════════
function setupStars(){
  document.querySelectorAll('.star').forEach(star=>{
    star.addEventListener('click',()=>{
      const v=parseInt(star.dataset.v);
      updateStars(v);
    });
    star.addEventListener('mouseover',()=>updateStars(parseInt(star.dataset.v),true));
    star.addEventListener('mouseout',()=>{
      const cur=currentModalBook?.rating||0;
      updateStars(cur);
    });
  });
}
function updateStars(val,preview=false){
  document.querySelectorAll('.star').forEach(s=>{
    s.classList.toggle('lit',parseInt(s.dataset.v)<=val);
  });
  if(!preview&&currentModalBook) currentModalBook.rating=val;
}

// ═══════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════
let selectedColor='#d4a843';
function setupColorPicker(){
  document.querySelectorAll('.cp').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.cp').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor=btn.dataset.color;
    });
  });
}
function openCatModal(){
  document.getElementById('cat-name').value='';
  document.getElementById('cat-overlay').classList.add('visible');
}
function closeCatModal(e){
  if(e&&e.target!==document.getElementById('cat-overlay')) return;
  document.getElementById('cat-overlay').classList.remove('visible');
}
function saveCat(){
  const name=document.getElementById('cat-name').value.trim();
  if(!name){alert('Escribe un nombre para la categoría');return;}
  categories.push({id:'cat_'+Date.now(),name,color:selectedColor});
  saveCategories();
  renderSidebar();
  document.getElementById('cat-overlay').classList.remove('visible');
  toast('📁 Categoría creada: '+name);
}

// ═══════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════
function setupSearch(){
  const input=document.getElementById('search-input');
  const clear=document.getElementById('search-clear');
  input.addEventListener('input',()=>{
    currentFilter.search=input.value;
    clear.style.display=input.value?'':'none';
    renderBooks();
  });
}
function clearSearch(){
  document.getElementById('search-input').value='';
  document.getElementById('search-clear').style.display='none';
  currentFilter.search='';
  renderBooks();
}

// ═══════════════════════════════════════════
//  VIEW TOGGLE
// ═══════════════════════════════════════════
function setView(v, save=true){
  currentView=v;
  if(save) localStorage.setItem('atk_view',v);
  document.getElementById('books-grid').dataset.view=v;
  document.getElementById('view-grid').classList.toggle('active',v==='grid');
  document.getElementById('view-list').classList.toggle('active',v==='list');
  renderBooks();
}

// ═══════════════════════════════════════════
//  DOCUMENT READER
// ═══════════════════════════════════════════
async function loadLib(url){
  if(document.querySelector(`script[src="${url}"]`)){
    return new Promise(res=>{
      const ex=document.querySelector(`script[src="${url}"]`);
      if(ex.dataset.loaded) return res();
      ex.onload=()=>{ex.dataset.loaded='1';res();};
    });
  }
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=url;
    s.onload=()=>{s.dataset.loaded='1';res();};
    s.onerror=rej;
    document.head.appendChild(s);
  });
}

function textToChapters(text,chunkSize=3000){
  const paras=text.split(/\n{2,}/);
  const chapters=[];
  let current='',idx=1;
  for(const para of paras){
    if((current+para).length>chunkSize&&current.length>100){
      chapters.push({title:'Sección '+idx++,content:current.trim()});
      current=para+'\n\n';
    } else { current+=para+'\n\n'; }
  }
  if(current.trim()) chapters.push({title:'Sección '+idx,content:current.trim()});
  return chapters.length?chapters:[{title:'Documento',content:text.trim()}];
}

async function openDocument(input){
  const file=input.files[0]; if(!file) return;
  try{
    const buf = await file.arrayBuffer();
    const epubKey = file.name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
    // Store a copy in IDB; use another copy for parsing
    await idbSet('file_'+epubKey, {buf: buf.slice(0), name:file.name, type:file.type||''});
    return openDocumentFromBuffer(file.name, buf.slice(0), null);
  }catch(e){
    console.warn('openDocument error',e);
    // Fallback: try reading file again directly
    return openDocumentFromBuffer(file.name, null, file);
  }
}

async function openDocumentFromBuffer(filename, buf, fileObj){
  const name = filename.toLowerCase();
  const label=document.getElementById('epub-label');
  const drop=document.getElementById('epub-drop');
  const area=document.getElementById('reader-text');
  label.textContent=filename;
  drop.classList.add('has-file');
  document.getElementById('reader-book-name').textContent=filename.replace(/\.[^.]+$/,'');
  area.innerHTML='<div class="empty-state"><div class="progress-spinner" style="width:36px;height:36px"></div><p style="margin-top:12px;color:var(--t2)">Leyendo documento…</p></div>';

  // Helper to get text from buf or fileObj
  async function readAsText(){
    if(buf) return new TextDecoder().decode(buf);
    return fileObj.text();
  }

  try{
    if(name.endsWith('.txt')||name.endsWith('.md')){
      const text=await readAsText();
      currentEpubKey=filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();
      epubChapters=textToChapters(text);
      finishLoad();

    } else if(name.match(/\.html?$/)){
      const text=await readAsText();
      const doc=new DOMParser().parseFromString(text,'text/html');
      epubChapters=textToChapters(doc.body.innerText||'');
      currentEpubKey=filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();
      finishLoad();

    } else if(name.endsWith('.pdf')){
      await loadLib('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      const pdfjsLib=window['pdfjs-dist/build/pdf']||window.pdfjsLib;
      if(!pdfjsLib) throw new Error('No se pudo cargar el lector de PDF');
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdfBuf=buf||await file.arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:pdfBuf}).promise;
      let pages=[];
      for(let p=1;p<=pdf.numPages;p++){
        const page=await pdf.getPage(p);
        const content=await page.getTextContent();
        const text=content.items.map(i=>i.str).join(' ').trim();
        if(text) pages.push(text);
      }
      const fullText=pages.join('\n\n');
      if(!fullText) throw new Error('El PDF no contiene texto extraíble');
      epubChapters=textToChapters(fullText,4000);
      currentEpubKey=file.name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
      finishLoad();

    } else if(name.endsWith('.docx')){
      await loadLib('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
      if(typeof mammoth==='undefined') throw new Error('No se pudo cargar mammoth');
      const docxBuf=buf||await file.arrayBuffer();
      const result=await mammoth.extractRawText({arrayBuffer:docxBuf});
      if(!result.value.trim()) throw new Error('DOCX vacío');
      epubChapters=textToChapters(result.value);
      currentEpubKey=file.name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
      finishLoad();

    } else if(name.endsWith('.epub')){
      await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      const epubBuf=buf||await file.arrayBuffer();
      const zip=await JSZip.loadAsync(epubBuf);
      const cont=zip.file('META-INF/container.xml');
      if(!cont) throw new Error('No es un EPUB válido');
      const contText=await cont.async('text');
      const opfPath=contText.match(/full-path="([^"]+)"/)?.[1];
      if(!opfPath) throw new Error('Falta manifiesto OPF');
      const opfText=await zip.file(opfPath).async('text');
      const opfDir=opfPath.includes('/')?opfPath.substring(0,opfPath.lastIndexOf('/')+1):'';
      const opfDoc=new DOMParser().parseFromString(opfText,'text/xml');
      const manifest={};
      opfDoc.querySelectorAll('manifest item').forEach(item=>{
        manifest[item.getAttribute('id')]={href:item.getAttribute('href'),type:item.getAttribute('media-type')||''};
      });
      const spineIds=[...opfDoc.querySelectorAll('spine itemref')].map(i=>i.getAttribute('idref')).filter(Boolean);

      function epubNodeToText(node){
        ['script','style','img','svg','figure','nav'].forEach(tag=>node.querySelectorAll(tag).forEach(el=>el.remove()));
        let text='';
        function walk(n){
          if(n.nodeType===3){text+=n.textContent;}
          else if(n.nodeType===1){
            const tag=n.tagName.toLowerCase();
            const block=['p','div','li','h1','h2','h3','h4','h5','h6','br','tr','blockquote'].includes(tag);
            if(block) text+='\n';
            for(const child of n.childNodes) walk(child);
            if(block) text+='\n';
          }
        }
        walk(node);
        return text.replace(/[\n]{3,}/g,'\n\n').trim();
      }

      epubChapters=[];
      for(const id of spineIds){
        const item=manifest[id];
        if(!item) continue;
        if(item.type&&!item.type.includes('html')&&!item.type.includes('xml')) continue;
        const fullPath=opfDir+item.href;
        const decoded=decodeURIComponent(item.href);
        const f=zip.file(fullPath)||zip.file(opfDir+decoded)||zip.file(item.href)||zip.file(decoded)||
          Object.values(zip.files).find(zf=>zf.name.endsWith('/'+item.href)||zf.name.endsWith('/'+decoded));
        if(!f) continue;
        const html=await f.async('text');
        const doc=new DOMParser().parseFromString(html,'text/html');
        const bodyText=doc.body?.textContent?.trim()||'';
        if(bodyText.length<50) continue;
        const navEls=doc.querySelectorAll('nav');
        const isNav=[...navEls].some(n=>{const t=n.getAttribute('epub:type')||n.getAttribute('type')||'';return t.includes('toc')||t.includes('landmarks');});
        if(isNav&&bodyText.length<500) continue;
        const titleEl=doc.querySelector('h1,h2,h3')||doc.querySelector('title');
        const title=titleEl?.textContent?.trim()||('Capítulo '+(epubChapters.length+1));
        const plainText=epubNodeToText(doc.body||doc.documentElement);
        if(!plainText.trim()) continue;
        epubChapters.push({title,content:plainText});
      }
      if(!epubChapters.length) throw new Error('No se pudo extraer texto del EPUB');
      currentEpubKey=filename.replace(/[^a-z0-9]/gi,'_').toLowerCase();
      finishLoad();
    } else {
      throw new Error('Formato no soportado. Usa EPUB, PDF, TXT, DOCX, HTML o MD.');
    }
  }catch(err){
    area.innerHTML=`<div class="empty-state"><div style="font-size:36px">⚠️</div><h2>Error leyendo el documento</h2><p>${err.message}</p></div>`;
    label.textContent='Abrir documento (EPUB, PDF, TXT, DOCX…)';
    drop.classList.remove('has-file');
  }
}

function finishLoad(){
  if(!currentEpubKey){console.warn('finishLoad: currentEpubKey empty');return;}
  // Save total chapters
  localStorage.setItem('atk_chtotal_'+currentEpubKey, epubChapters.length);
  // Save the active book key so we can restore on next session
  localStorage.setItem('atk_lastbook', currentEpubKey);
  renderToc();
  // Restore saved chapter position
  const raw=localStorage.getItem('atk_ch_'+currentEpubKey);
  const savedCh=raw!==null?Math.max(0,parseInt(raw)):0;
  const targetCh=Math.min(savedCh, epubChapters.length-1);
  // Call showChapter WITHOUT triggering stopReading (which resets things)
  _showChapterSilent(targetCh);
  // Mark book as reading if found in library
  const book=books.find(b=>b.epubKey===currentEpubKey);
  if(book&&book.status==='unread'){
    book.status='reading';
    saveBooks();
    renderBooks();
    updateStats();
  }
}

// showChapter without stopReading — used only by finishLoad on initial load
function _showChapterSilent(idx){
  if(idx<0||idx>=epubChapters.length) idx=0;
  currentChapter=idx;
  const ch=epubChapters[idx];
  // Don't overwrite the saved position on initial load
  const area=document.getElementById('reader-text');
  area.innerHTML=ch.content.split('\n').map(line=>{
    const t=line.trim();
    if(!t) return '';
    if(t.match(/^#{1,3}\s/)) return `<h2>${escHtml(t.replace(/^#+\s*/,''))}</h2>`;
    return `<p>${escHtml(t)}</p>`;
  }).join('');
  area.scrollTop=0;
  document.querySelectorAll('.reader-toc-item').forEach((el,i)=>el.classList.toggle('active',i===idx));
  document.getElementById('ch-counter').textContent=(idx+1)+' / '+epubChapters.length;
  document.getElementById('prev-ch-btn').disabled=idx<=0;
  document.getElementById('next-ch-btn').disabled=idx>=epubChapters.length-1;
  renderBooks();
}

function renderToc(){
  const toc=document.getElementById('reader-toc');
  toc.innerHTML=epubChapters.map((ch,i)=>
    `<div class="reader-toc-item ${i===currentChapter?'active':''}" onclick="showChapter(${i})">${escHtml(ch.title)}</div>`
  ).join('');
}

function showChapter(idx){
  if(idx<0||idx>=epubChapters.length) return;
  stopReading();
  currentChapter=idx;
  const ch=epubChapters[idx];
  if(currentEpubKey) try{localStorage.setItem('atk_ch_'+currentEpubKey,idx);}catch(e){}
  const area=document.getElementById('reader-text');
  area.innerHTML=ch.content.split('\n').map(line=>{
    const t=line.trim();
    if(!t) return '';
    if(t.match(/^#{1,3}\s/)) return `<h2>${escHtml(t.replace(/^#+\s*/,''))}</h2>`;
    return `<p>${escHtml(t)}</p>`;
  }).join('');
  area.scrollTop=0;
  document.querySelectorAll('.reader-toc-item').forEach((el,i)=>el.classList.toggle('active',i===idx));
  document.getElementById('ch-counter').textContent=(idx+1)+' / '+epubChapters.length;
  document.getElementById('prev-ch-btn').disabled=idx<=0;
  document.getElementById('next-ch-btn').disabled=idx>=epubChapters.length-1;
  // Update mini player chapter
  if(currentEpubBookId){
    document.getElementById('mp-chapter').textContent=ch.title;
  }
  // Update progress
  renderBooks();
}

function prevChapter(){ if(currentChapter>0) showChapter(currentChapter-1); }
function nextChapter(){ if(currentChapter<epubChapters.length-1) showChapter(currentChapter+1); }

// ═══════════════════════════════════════════
//  TTS / READING
// ═══════════════════════════════════════════
async function readCurrentChapter(){
  const isWebSpeech=currentProvider==='webspeech';
  if(!isWebSpeech&&!apiKeys[currentProvider]){openApiModal();return;}
  if(!epubChapters.length){toast('⚠️ Abre un libro primero');return;}
  const voiceId=document.getElementById('reader-voice').value;
  if(!voiceId&&currentProvider!=='webspeech'){toast('⚠️ Selecciona una voz');return;}
  const ch=epubChapters[currentChapter];
  const cleanText=ch.content.replace(/\s+/g,' ').trim().substring(0,5000);
  stopReading();
  const btn=document.getElementById('read-btn');
  btn.disabled=true;btn.innerHTML='⏳ Generando…';
  document.getElementById('stop-btn').style.display='flex';
  try{
    const model=PROVIDERS[currentProvider]?.models?.[0]?.id||'';
    startBackgroundKeepalive(); // start keepalive before TTS so audio focus is held
    const blob=await ttsRequest(cleanText,voiceId,model);
    if(blob!==null){
      // API-based TTS — use real <audio> element
      const url=URL.createObjectURL(blob);
      setupPlayer('reader',url,blob,ch.title);
      document.getElementById('reader-player-wrap').style.display='block';
      const audio=audioElements['reader'];
      audio.playbackRate=parseFloat(document.getElementById('read-speed').value);
      audio.play();
      document.getElementById('reader-play').textContent='⏸';
      // Show mini player + MediaSession
      showMiniPlayer(audio,ch.title);
      audio.onended=()=>{
        document.getElementById('reader-play').textContent='▶';
        document.getElementById('stop-btn').style.display='none';
        if(currentChapter<epubChapters.length-1){
          setTimeout(()=>{showChapter(currentChapter+1);readCurrentChapter();},800);
        } else {
          stopBackgroundKeepalive();
          hideMiniPlayer();
          const book=books.find(b=>b.epubKey===currentEpubKey);
          if(book){book.status='read';saveBooks();renderBooks();updateStats();}
        }
      };
    } else {
      // WebSpeech — speaks directly, no blob
      // Update MediaSession with fake audio element trick for lock screen widget
      document.getElementById('stop-btn').style.display='flex';
      btn.disabled=false;btn.innerHTML='▶ Leer';
      // Show mini player using silent audio for lock screen controls
      if(_silentAudio){
        showMiniPlayer(_silentAudio, ch.title);
      }
      // When WebSpeech finishes, auto-advance
      // ttsRequest already resolved — advance chapter now
      if(currentChapter<epubChapters.length-1){
        setTimeout(()=>{showChapter(currentChapter+1);readCurrentChapter();},800);
      } else {
        stopBackgroundKeepalive();
        hideMiniPlayer();
        const book=books.find(b=>b.epubKey===currentEpubKey);
        if(book){book.status='read';saveBooks();renderBooks();updateStats();}
      }
      return; // skip the btn reset below
    }
  }catch(e){
    stopBackgroundKeepalive();
    toast('❌ '+e.message);
  }
  btn.disabled=false;btn.innerHTML='▶ Leer';
  document.getElementById('stop-btn').style.display='none';
}

function stopReading(){
  const audio=audioElements['reader'];
  if(audio) audio.pause();
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  stopBackgroundKeepalive();
  const pb=document.getElementById('reader-play');
  if(pb) pb.textContent='▶';
  const sb=document.getElementById('stop-btn');
  if(sb) sb.style.display='none';
  const rb=document.getElementById('read-btn');
  if(rb){rb.textContent='▶ Leer';rb.disabled=false;}
}

// ═══════════════════════════════════════════
//  MINI PLAYER
// ═══════════════════════════════════════════
function showMiniPlayer(audio, chapterTitle){
  miniPlayerAudio=audio;
  const mp=document.getElementById('mini-player');
  mp.classList.add('visible');
  document.getElementById('mp-chapter').textContent=chapterTitle||'—';
  // Book info
  const book=books.find(b=>b.epubKey===currentEpubKey);
  if(book){
    currentEpubBookId=book.id;
    document.getElementById('mp-book-title').textContent=book.title||book.filename||'—';
    if(book.coverData){
      document.getElementById('mp-cover').src=book.coverData;
      document.getElementById('mp-cover').style.display='block';
      document.getElementById('mp-cover-ph').style.display='none';
    } else {
      document.getElementById('mp-cover').style.display='none';
      document.getElementById('mp-cover-ph').style.display='flex';
    }
  } else {
    document.getElementById('mp-book-title').textContent=document.getElementById('reader-book-name').textContent||'—';
  }

  audio.addEventListener('timeupdate',updateMiniProgress);
  audio.addEventListener('play',()=>document.getElementById('mp-play-btn').textContent='⏸');
  audio.addEventListener('pause',()=>document.getElementById('mp-play-btn').textContent='▶');
  updateMiniSpeed();
  updateMediaSession();
  renderBooks(); // refresh playing indicator
}

function hideMiniPlayer(){
  document.getElementById('mini-player').classList.remove('visible');
  miniPlayerAudio=null;
  currentEpubBookId=null;
  renderBooks();
}

function closeMiniPlayer(){
  if(miniPlayerAudio) miniPlayerAudio.pause();
  hideMiniPlayer();
}

function updateMiniProgress(){
  const audio=miniPlayerAudio;
  if(!audio) return;
  const pct=audio.duration?(audio.currentTime/audio.duration*100):0;
  document.getElementById('mp-prog-fill').style.width=pct+'%';
  document.getElementById('mp-cur').textContent=fmtTime(audio.currentTime);
  document.getElementById('mp-dur').textContent=fmtTime(audio.duration);
}

function seekMiniPlayer(e){
  if(!miniPlayerAudio||!miniPlayerAudio.duration) return;
  const rect=e.currentTarget.getBoundingClientRect();
  miniPlayerAudio.currentTime=((e.clientX-rect.left)/rect.width)*miniPlayerAudio.duration;
}

function toggleMiniPlay(){
  if(!miniPlayerAudio) return;
  if(miniPlayerAudio.paused) miniPlayerAudio.play();
  else miniPlayerAudio.pause();
}

function setMiniVolume(v){
  if(miniPlayerAudio) miniPlayerAudio.volume=parseFloat(v);
}

function skip(secs){
  if(!miniPlayerAudio) return;
  miniPlayerAudio.currentTime=Math.max(0,Math.min(miniPlayerAudio.duration||0,miniPlayerAudio.currentTime+secs));
}

function cycleSpeed(){
  speedIdx=(speedIdx+1)%speedSteps.length;
  const spd=speedSteps[speedIdx];
  if(miniPlayerAudio) miniPlayerAudio.playbackRate=spd;
  updateMiniSpeed();
}

function updateMiniSpeed(){
  const spd=speedSteps[speedIdx];
  document.getElementById('mp-speed-btn').textContent=spd+'×';
}

// ═══════════════════════════════════════════
//  MEDIA SESSION API (lock screen / notification widget)
// ═══════════════════════════════════════════
function setupMediaSession(){
  if(!('mediaSession' in navigator)) return;
  // Will be fully configured in updateMediaSession when audio starts
}

function updateMediaSession(){
  if(!('mediaSession' in navigator)||!miniPlayerAudio) return;
  const book=books.find(b=>b.epubKey===currentEpubKey);
  const bookTitle=book?.title||document.getElementById('reader-book-name').textContent||'Audioteka';
  const artist=book?.author||'Audioteka';
  const ch=epubChapters[currentChapter];
  const chTitle=ch?.title||bookTitle;

  // Build artwork array — prefer book cover, fall back to emoji SVG
  const artwork=[];
  if(book?.coverData){
    artwork.push({src:book.coverData, sizes:'512x512', type:'image/jpeg'});
    artwork.push({src:book.coverData, sizes:'192x192', type:'image/jpeg'});
  }
  // Always add SVG fallback
  const svgIcon=`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="%230e0e1a"/><text y="380" x="50" font-size="380">🎧</text></svg>`;
  artwork.push({src:svgIcon, sizes:'512x512', type:'image/svg+xml'});

  navigator.mediaSession.metadata=new MediaMetadata({
    title: chTitle,
    artist,
    album: bookTitle,
    artwork
  });

  // Playback state
  navigator.mediaSession.playbackState = miniPlayerAudio.paused ? 'paused' : 'playing';

  // Action handlers
  navigator.mediaSession.setActionHandler('play', ()=>{
    miniPlayerAudio?.play();
    navigator.mediaSession.playbackState='playing';
  });
  navigator.mediaSession.setActionHandler('pause', ()=>{
    miniPlayerAudio?.pause();
    navigator.mediaSession.playbackState='paused';
  });
  navigator.mediaSession.setActionHandler('stop', ()=>{
    stopReading();
    navigator.mediaSession.playbackState='none';
  });
  navigator.mediaSession.setActionHandler('previoustrack', ()=>{
    if(currentChapter>0){showChapter(currentChapter-1);readCurrentChapter();}
  });
  navigator.mediaSession.setActionHandler('nexttrack', ()=>{
    if(currentChapter<epubChapters.length-1){showChapter(currentChapter+1);readCurrentChapter();}
  });
  navigator.mediaSession.setActionHandler('seekbackward', (d)=>skip(-(d?.seekOffset||30)));
  navigator.mediaSession.setActionHandler('seekforward',  (d)=>skip( d?.seekOffset||30));

  // Position state (enables seek bar on lock screen)
  try{
    if(miniPlayerAudio.duration && !isNaN(miniPlayerAudio.duration)){
      navigator.mediaSession.setPositionState({
        duration: miniPlayerAudio.duration,
        playbackRate: miniPlayerAudio.playbackRate||1,
        position: miniPlayerAudio.currentTime||0
      });
    }
  }catch(e){}

  // Keep position state in sync
  if(!miniPlayerAudio._msSync){
    miniPlayerAudio._msSync=true;
    miniPlayerAudio.addEventListener('timeupdate',()=>{
      if(!('mediaSession' in navigator)||!miniPlayerAudio.duration||isNaN(miniPlayerAudio.duration)) return;
      try{
        navigator.mediaSession.setPositionState({
          duration:miniPlayerAudio.duration,
          playbackRate:miniPlayerAudio.playbackRate||1,
          position:miniPlayerAudio.currentTime||0
        });
      }catch(e){}
    });
    miniPlayerAudio.addEventListener('play', ()=>{
      if('mediaSession' in navigator) navigator.mediaSession.playbackState='playing';
    });
    miniPlayerAudio.addEventListener('pause', ()=>{
      if('mediaSession' in navigator) navigator.mediaSession.playbackState='paused';
    });
  }
}

// ═══════════════════════════════════════════
//  BACKGROUND AUDIO KEEPALIVE
//  Prevents Android from killing WebSpeech when screen off
// ═══════════════════════════════════════════
let _silentAudio=null;
let _bgKeepaliveTimer=null;

function startBackgroundKeepalive(){
  // 1. Play a silent looping audio to hold AudioFocus
  if(!_silentAudio){
    // 1-second silent MP3 as base64
    const silentMp3='data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAADQgD///////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAA5TGFNRQ==';
    _silentAudio=new Audio(silentMp3);
    _silentAudio.loop=true;
    _silentAudio.volume=0.001; // near-silent but non-zero
  }
  _silentAudio.play().catch(()=>{});

  // 2. Watchdog: if WebSpeech pauses unexpectedly, resume it
  if(_bgKeepaliveTimer) clearInterval(_bgKeepaliveTimer);
  _bgKeepaliveTimer=setInterval(()=>{
    if(!window.speechSynthesis) return;
    if(window.speechSynthesis.paused) window.speechSynthesis.resume();
  },4000);
}

function stopBackgroundKeepalive(){
  if(_silentAudio){_silentAudio.pause();_silentAudio.currentTime=0;}
  if(_bgKeepaliveTimer){clearInterval(_bgKeepaliveTimer);_bgKeepaliveTimer=null;}
}

// Handle visibility change — resume speech if page comes back from background
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) return;
  // Page became visible — resume if speech was active
  if(window.speechSynthesis?.paused) window.speechSynthesis.resume();
});


async function ttsRequest(text,voiceId,model){
  if(currentProvider==='webspeech'){
    return new Promise((resolve,reject)=>{
      if(!window.speechSynthesis){reject(new Error('Tu navegador no soporta Web Speech API'));return;}
      window.speechSynthesis.cancel();
      const speak=()=>{
        const synth=window.speechSynthesis;
        const allVoices=synth.getVoices();
        const found=allVoices.find(v=>v.voiceURI===voiceId)||null;
        const inReader=document.getElementById('panel-reader')?.classList.contains('active');
        const rate=parseFloat(document.getElementById(inReader?'read-speed':'synth-speed')?.value||'1');
        const pitch=parseFloat(document.getElementById('synth-pitch')?.value||'1');
        const volume=parseFloat(document.getElementById('synth-vol')?.value||'1');
        const lang=found?found.lang:'es-ES';
        const raw=text.replace(/\s+/g,' ').trim();
        const chunks=[];
        const sentences=raw.match(/[^.!?]+[.!?]+[\s]*/g)||[raw];
        let current='';
        for(const s of sentences){
          if((current+s).length>200&&current.length>0){chunks.push(current.trim());current=s;}
          else current+=s;
        }
        if(current.trim()) chunks.push(current.trim());
        if(!chunks.length){resolve(null);return;}
        let idx=0;
        let watchdog=null;
        const speakNext=()=>{
          if(idx>=chunks.length){clearTimeout(watchdog);resolve(null);return;}
          const utt=new SpeechSynthesisUtterance(chunks[idx++]);
          utt.rate=rate;utt.pitch=pitch;utt.volume=volume;utt.lang=lang;
          if(found) utt.voice=found;
          utt.onend=()=>{clearTimeout(watchdog);speakNext();};
          utt.onerror=(e)=>{
            clearTimeout(watchdog);
            if(e.error==='interrupted'||e.error==='canceled'){resolve(null);return;}
            speakNext();
          };
          watchdog=setTimeout(()=>{synth.pause();synth.resume();watchdog=setTimeout(()=>speakNext(),1500);},8000);
          synth.speak(utt);
        };
        setTimeout(speakNext,100);
      };
      const vs=window.speechSynthesis.getVoices();
      if(vs.length>0) speak();
      else{window.speechSynthesis.onvoiceschanged=()=>speak();setTimeout(speak,1000);}
    });
  }

  const key=apiKeys[currentProvider];
  if(!key||key==='nokey') throw new Error('Sin API key. Configúrala en Conectar API.');

  if(currentProvider==='elevenlabs'){
    const r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+voiceId,{
      method:'POST',
      headers:{'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},
      body:JSON.stringify({text,model_id:model||'eleven_multilingual_v2',voice_settings:{stability:.5,similarity_boost:.75,style:0,use_speaker_boost:true}})
    });
    if(!r.ok){
      let msg='ElevenLabs error '+r.status;
      try{const e=await r.json();msg=e.detail?.message||e.message||msg;}catch{}
      if(r.status===401) msg='API key inválida. Revisa tu key de ElevenLabs.';
      if(r.status===429) msg='Cuota agotada en ElevenLabs.';
      throw new Error(msg);
    }
    return await r.blob();
  }

  if(currentProvider==='openai'){
    const r=await fetch('https://api.openai.com/v1/audio/speech',{
      method:'POST',
      headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({model:model||'tts-1-hd',voice:voiceId,input:text,response_format:'mp3'})
    });
    if(!r.ok){
      let msg='OpenAI TTS error '+r.status;
      try{const e=await r.json();msg=e.error?.message||msg;}catch{}
      if(r.status===401) msg='API key de OpenAI inválida.';
      if(r.status===429) msg='Sin créditos o rate limit en OpenAI.';
      throw new Error(msg);
    }
    return await r.blob();
  }

  if(currentProvider==='unrealspeech'){
    const usBody={Text:text,VoiceId:voiceId,Bitrate:'192k',Speed:'0',Pitch:'1',TimestampType:'word'};
    let r;
    try{
      r=await fetch('https://api.v8.unrealspeech.com/stream',{
        method:'POST',
        headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
        body:JSON.stringify(usBody)
      });
    }catch{r=null;}
    if(!r||(!r.ok&&r.status!==401)){
      try{
        r=await fetch('https://api.v8.unrealspeech.com/speech',{
          method:'POST',
          headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
          body:JSON.stringify({Text:text,VoiceId:voiceId,Bitrate:'192k',OutputFormat:'uri',TimestampType:'word'})
        });
      }catch(e2){throw new Error('No se pudo conectar con Unreal Speech');}
    }
    if(!r||!r.ok){
      let et='';
      try{const ej=await r.json();et=ej.detail||ej.message||'';}catch{}
      if(r?.status===401) throw new Error('API key de Unreal Speech inválida.');
      throw new Error('Unreal Speech error '+(r?.status||'')+(et?': '+et:''));
    }
    const ct=r.headers.get('content-type')||'';
    if(ct.includes('application/json')){
      const data=await r.json();
      const audioUrl=data.OutputUri||data.output_uri||data.url;
      if(!audioUrl) throw new Error('Unreal Speech no devolvió URL de audio');
      for(let i=0;i<20;i++){
        const ar=await fetch(audioUrl).catch(()=>null);
        if(ar&&ar.ok) return await ar.blob();
        await new Promise(r=>setTimeout(r,1000));
      }
      throw new Error('Timeout esperando audio de Unreal Speech');
    }
    return await r.blob();
  }

  if(currentProvider==='playht'){
    const userId=apiKeys['playht_extra']||'';
    if(!userId) throw new Error('PlayHT requiere User ID. Configúralo en Conectar API.');
    const r=await fetch('https://api.play.ht/api/v2/tts/stream',{
      method:'POST',
      headers:{'Authorization':'Bearer '+key,'X-User-Id':userId,'Content-Type':'application/json','Accept':'audio/mpeg'},
      body:JSON.stringify({text,voice:voiceId,output_format:'mp3',voice_engine:model||'PlayHT2.0-turbo'})
    });
    if(!r.ok){
      let msg='PlayHT error '+r.status;
      try{const e=await r.json();msg=e.error_message||e.message||msg;}catch{}
      if(r.status===401) msg='API key o User ID de PlayHT incorrectos.';
      throw new Error(msg);
    }
    return await r.blob();
  }

  throw new Error('Proveedor no reconocido: '+currentProvider);
}

// ═══════════════════════════════════════════
//  AUDIO PLAYER (inline)
// ═══════════════════════════════════════════
function setupPlayer(id,url,blob,filename){
  if(audioElements[id]) audioElements[id].pause();
  const audio=new Audio(url);
  audioElements[id]=audio;
  audio.addEventListener('timeupdate',()=>updateProgress(id,audio));
  audio.addEventListener('ended',()=>{document.getElementById(id+'-play').textContent='▶';});
  audio.addEventListener('loadedmetadata',()=>{document.getElementById(id+'-dur').textContent=fmtTime(audio.duration);});
  const dl=document.getElementById(id+'-dl');
  dl.href=url;dl.download=(filename||'audio').replace(/[<>:"/\\|?*]/g,'_')+'.mp3';
}

function togglePlay(id){
  const audio=audioElements[id];
  const btn=document.getElementById(id+'-play');
  if(!audio) return;
  if(audio.paused){audio.play();btn.textContent='⏸';}
  else{audio.pause();btn.textContent='▶';}
}

function updateProgress(id,audio){
  const pct=audio.duration?(audio.currentTime/audio.duration*100):0;
  document.getElementById(id+'-pfill').style.width=pct+'%';
  document.getElementById(id+'-cur').textContent=fmtTime(audio.currentTime);
}

function seekAudio(id,e){
  const audio=audioElements[id];
  if(!audio||!audio.duration) return;
  const rect=e.currentTarget.getBoundingClientRect();
  audio.currentTime=((e.clientX-rect.left)/rect.width)*audio.duration;
}

function fmtTime(s){
  if(!s||isNaN(s)) return '0:00';
  const m=Math.floor(s/60);
  const sec=Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

// ═══════════════════════════════════════════
//  SYNTHESIZE
// ═══════════════════════════════════════════
async function synthesize(){
  if(!PROVIDERS[currentProvider]?.noKeyRequired&&!apiKeys[currentProvider]){openApiModal();return;}
  const text=document.getElementById('synth-text').value.trim();
  if(!text){toast('⚠️ Escribe un texto primero');return;}
  let voiceId=document.getElementById('synth-voice').value;
  if(!voiceId&&currentProvider==='webspeech'){
    voices=loadWebSpeechVoices();populateVoiceSelects();
    voiceId=document.getElementById('synth-voice').value;
  }
  if(!voiceId&&currentProvider!=='webspeech'){toast('⚠️ Selecciona una voz primero');return;}
  const model=PROVIDERS[currentProvider]?.models?.[0]?.id||'';
  const btn=document.getElementById('synth-btn');
  btn.disabled=true;btn.textContent='⏳ Generando…';
  document.getElementById('synth-progress').style.display='block';
  document.getElementById('synth-result').style.display='none';
  try{
    const blob=await ttsRequest(text,voiceId,model);
    if(blob!==null){
      const url=URL.createObjectURL(blob);
      setupPlayer('synth',url,blob,text.substring(0,30));
      document.getElementById('synth-result').style.display='block';
    }
  }catch(e){
    toast('❌ '+e.message);
  }
  btn.disabled=false;btn.textContent='🎙️ Generar audio';
  document.getElementById('synth-progress').style.display='none';
}

function updateSynthCharCount(){
  const t=document.getElementById('synth-text').value;
  document.getElementById('synth-char-count').textContent=t.length.toLocaleString()+' caracteres';
}

function syncSliderLabel(sliderId,labelId,suffix){
  const v=parseFloat(document.getElementById(sliderId).value);
  document.getElementById(labelId).textContent=v.toFixed(2).replace(/\.?0+$/,'')+suffix;
}

function updatePitchLabel(sliderId,labelId){
  const v=parseFloat(document.getElementById(sliderId).value);
  const labels={0.5:'muy grave',0.6:'grave',0.7:'grave',0.8:'algo grave',0.9:'algo grave',
    1.0:'normal',1.1:'algo agudo',1.2:'algo agudo',1.3:'algo agudo',1.4:'agudo',1.5:'agudo',
    1.6:'muy agudo',1.7:'muy agudo',1.8:'muy agudo',1.9:'muy agudo',2.0:'muy agudo'};
  const k=Math.round(v*10)/10;
  document.getElementById(labelId).textContent=labels[k]||(v<1?'grave':'agudo');
}

// ═══════════════════════════════════════════
//  VOICES
// ═══════════════════════════════════════════
function loadWebSpeechVoices(){
  if(!window.speechSynthesis) return[];
  const raw=window.speechSynthesis.getVoices();
  // All Spanish voices
  const esVoices=raw.filter(v=>v.lang.toLowerCase().startsWith('es'));
  if(!esVoices.length){
    return[{voice_id:'__fallback__',name:'⚠️ Sin voces en español instaladas',labels:{lang:'es',accent:''}}];
  }
  const ACCENT_LABELS={
    'es-es':'🇪🇸 España','es-mx':'🇲🇽 México','es-us':'🇺🇸 EEUU',
    'es-ar':'🇦🇷 Argentina','es-co':'🇨🇴 Colombia','es-419':'🌎 Latam','es-xl':'🌎 Latam'
  };
  // Score: Google/Microsoft/Apple first, then any, skip pure TTS junk
  const junk=['espeak','mbrola','festival','pico','eloquence'];
  const quality=['google','microsoft','apple','samsung'];
  const score=v=>{
    const n=v.name.toLowerCase();
    if(junk.some(w=>n.includes(w))) return -1;
    if(quality.some(w=>n.includes(w))) return 10;
    if(!v.localService) return 5; // cloud/network voices tend to be better
    return 1;
  };
  const seen=new Set();
  return esVoices
    .filter(v=>{ const k=v.name+v.lang; if(seen.has(k)) return false; seen.add(k); return score(v)>=0; })
    .sort((a,b)=>score(b)-score(a))
    .map(v=>{
      const langKey=v.lang.toLowerCase().slice(0,5);
      const accent=ACCENT_LABELS[langKey]||('🌍 '+v.lang);
      const cleanName=v.name.replace(/\s*\([a-z]{2}[-_][A-Z]{2,3}\)\s*$/,'').trim();
      const genderHint=v.name.toLowerCase().includes('female')||['helena','monica','lucia','sofia','maria','paloma'].some(n=>v.name.toLowerCase().includes(n))?'♀':'♂';
      return{voice_id:v.voiceURI,name:cleanName+' '+genderHint+' '+accent,labels:{lang:'es',accent:v.lang},_wsVoice:v};
    });
}

function loadVoicesForProvider(){
  const p=PROVIDERS[currentProvider];
  if(!p) return;
  if(p.voicesSource==='webspeech'){
    const apply=()=>{voices=loadWebSpeechVoices();populateVoiceSelects();renderVoiceGrid();};
    let attempts=0;
    const tryLoad=()=>{
      const raw=window.speechSynthesis?.getVoices()||[];
      const hasGoogle=raw.some(v=>v.name.toLowerCase().includes('google'));
      attempts++;apply();
      if(!hasGoogle&&attempts<8) setTimeout(tryLoad,500);
    };
    if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=apply;
    tryLoad();
  } else if(p.voicesSource==='api'){
    if(apiKeys[currentProvider]) loadVoices();
    else{voices=JSON.parse(localStorage.getItem('voz_voices_'+currentProvider)||'[]');populateVoiceSelects();}
  } else {
    voices=p.staticVoices||[];
    localStorage.setItem('voz_voices_'+currentProvider,JSON.stringify(voices));
    populateVoiceSelects();renderVoiceGrid();
  }
}

function populateVoiceSelects(){
  const opts=voices.map(v=>`<option value="${v.voice_id}" ${v.voice_id===selectedVoiceId?'selected':''}>${v.name}</option>`).join('');
  document.getElementById('synth-voice').innerHTML=opts;
  document.getElementById('reader-voice').innerHTML=opts;
}

async function loadVoices(){
  if(!apiKeys[currentProvider]){openApiModal();return;}
  const p=PROVIDERS[currentProvider];
  if(p?.voicesSource==='static'){voices=p.staticVoices||[];renderVoiceGrid();populateVoiceSelects();return;}
  try{
    const r=await fetch('https://api.elevenlabs.io/v1/voices',{headers:{'xi-api-key':apiKeys.elevenlabs||apiKey}});
    const d=await r.json();
    if(!r.ok) throw new Error(d.detail?.message||'Error');
    voices=d.voices||[];
    localStorage.setItem('voz_voices_'+currentProvider,JSON.stringify(voices));
    renderVoiceGrid();populateVoiceSelects();
  }catch(e){toast('❌ '+e.message);}
}

function renderVoiceGrid(){
  const grid=document.getElementById('voices-grid');
  if(!voices.length){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div style="font-size:40px">🎭</div><h2>Sin voces</h2></div>';return;}
  grid.innerHTML=voices.map(v=>{
    const isSel=v.voice_id===selectedVoiceId;
    const isCustom=v.category==='cloned'||v.category==='generated';
    const emoji=v.category==='cloned'?'🔬':v.category==='generated'?'✨':'🎙️';
    const badgeText=v.category==='cloned'?'Clonada':v.category==='generated'?'Generada':'Predefinida';
    const badgeClass=v.category==='cloned'?'purple':v.category==='generated'?'amber':'green';
    return`<div class="voice-card ${isSel?'selected':''}" id="vc-${v.voice_id}" onclick="selectVoice('${v.voice_id}')">
      <div class="vc-top">
        <div class="vc-avatar" style="background:${strColor(v.name)}">${emoji}</div>
        <div style="min-width:0">
          <div class="vc-name">${escHtml(v.name)}</div>
          <div class="vc-meta">${v.labels?.accent||''} ${v.labels?.gender||''}</div>
        </div>
      </div>
      <span class="badge ${badgeClass}" style="margin-top:4px">${badgeText}</span>
      <div class="vc-btns" style="margin-top:8px">
        <button class="vc-btn" onclick="previewVoice(event,'${v.voice_id}','${escHtml(v.name)}')">▶ Preview</button>
        ${isCustom?`<button class="vc-btn del" onclick="deleteVoice(event,'${v.voice_id}')">Borrar</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function selectVoice(id){
  selectedVoiceId=id;
  localStorage.setItem('voz_selected',id);
  document.querySelectorAll('.voice-card').forEach(c=>c.classList.remove('selected'));
  document.getElementById('vc-'+id)?.classList.add('selected');
  populateVoiceSelects();
}

async function previewVoice(e,voiceId,name){
  e.stopPropagation();
  const btn=e.currentTarget;
  if(currentProvider==='elevenlabs'){
    const voice=voices.find(v=>v.voice_id===voiceId);
    if(voice?.preview_url){
      const audio=new Audio(voice.preview_url);
      audio.play().catch(()=>{});
      btn.textContent='⏸ Sonando';
      audio.onended=()=>{btn.textContent='▶ Preview';};
      return;
    }
  }
  const sampleText='Hola, soy '+name+'. Esta es mi voz.';
  const orig=btn.textContent;
  btn.textContent='⏳';btn.disabled=true;
  try{
    const model=PROVIDERS[currentProvider]?.models?.[0]?.id||'';
    const blob=await ttsRequest(sampleText,voiceId,model);
    if(blob){
      const url=URL.createObjectURL(blob);
      const audio=new Audio(url);audio.play();
      btn.textContent='⏸ Sonando';
      audio.onended=()=>{btn.textContent=orig;btn.disabled=false;};
    } else {
      btn.textContent=orig;btn.disabled=false;
    }
  }catch(err){btn.textContent=orig;btn.disabled=false;toast('❌ '+err.message);}
}

async function deleteVoice(e,voiceId){
  e.stopPropagation();
  if(!confirm('¿Eliminar esta voz clonada?')) return;
  try{
    await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`,{method:'DELETE',headers:{'xi-api-key':apiKey}});
    voices=voices.filter(v=>v.voice_id!==voiceId);
    renderVoiceGrid();populateVoiceSelects();
  }catch(e){toast('❌ '+e.message);}
}

function strColor(str){
  let hash=0;for(const c of str) hash=c.charCodeAt(0)+((hash<<5)-hash);
  const colors=['rgba(192,132,252,.2)','rgba(96,165,250,.2)','rgba(61,214,140,.2)','rgba(245,158,11,.2)','rgba(240,68,68,.2)','rgba(212,168,67,.2)'];
  return colors[Math.abs(hash)%colors.length];
}

// ═══════════════════════════════════════════
//  API MODAL
// ═══════════════════════════════════════════
function buildProviderGrid(){
  const grid=document.getElementById('provider-grid');
  grid.innerHTML=Object.entries(PROVIDERS).map(([key,p])=>{
    const isSel=key===selectedProviderInModal;
    const hasKey=!!apiKeys[key];
    return`<div onclick="selectProviderInModal('${key}')" class="pg-item ${isSel?'selected':''}" style="${isSel?'border-color:'+p.color+';background:'+p.color+'11':''}">
      ${hasKey?`<div class="pg-dot"></div>`:''}
      <div class="pg-emoji">${p.emoji}</div>
      <div class="pg-name">${p.name}</div>
      <div class="pg-free" style="color:${p.color}">${p.free}</div>
    </div>`;
  }).join('');
  updateProviderInfo();
}

function selectProviderInModal(key){
  selectedProviderInModal=key;
  buildProviderGrid();
  const p=PROVIDERS[key];
  const isNoKey=p?.noKeyRequired;
  const inp=document.getElementById('api-key-input');
  document.getElementById('api-key-wrap').style.display=isNoKey?'none':'block';
  inp.value=isNoKey?'':(apiKeys[key]||'');
  inp.placeholder=p.keyPlaceholder||'API Key';
  const extra=document.getElementById('extra-field-wrap');
  if(p.extraField){
    extra.style.display='block';
    document.getElementById('api-extra-input').placeholder=p.extraPlaceholder||'';
    document.getElementById('api-extra-input').value=apiKeys[key+'_extra']||'';
  } else { extra.style.display='none'; }
}

function updateProviderInfo(){
  const p=PROVIDERS[selectedProviderInModal];
  if(!p) return;
  document.getElementById('provider-info').innerHTML=p.info;
  document.getElementById('key-link').innerHTML=`<a href="${p.keyLinkUrl}" target="_blank" style="color:var(--gold);text-decoration:none">${p.keyLink}</a>`;
}

function openApiModal(){
  selectedProviderInModal=currentProvider;
  buildProviderGrid();
  const p=PROVIDERS[currentProvider];
  const isNoKey=p?.noKeyRequired;
  document.getElementById('api-key-wrap').style.display=isNoKey?'none':'block';
  document.getElementById('api-key-input').value=isNoKey?'':(apiKeys[currentProvider]||'');
  document.getElementById('api-key-input').placeholder=p?.keyPlaceholder||'API Key';
  const extra=document.getElementById('extra-field-wrap');
  if(p?.extraField){
    extra.style.display='block';
    document.getElementById('api-extra-input').placeholder=p.extraPlaceholder;
    document.getElementById('api-extra-input').value=apiKeys[currentProvider+'_extra']||'';
  } else { extra.style.display='none'; }
  document.getElementById('api-overlay').classList.add('visible');
}

function closeApiModal(e){
  if(e&&e.target!==document.getElementById('api-overlay')) return;
  document.getElementById('api-overlay').classList.remove('visible');
}

function saveApiKey(){
  const isNoKey=PROVIDERS[selectedProviderInModal]?.noKeyRequired;
  const key=isNoKey?'nokey':document.getElementById('api-key-input').value.trim();
  if(!isNoKey&&!key){alert('Introduce tu API key');return;}
  apiKeys[selectedProviderInModal]=key;
  if(PROVIDERS[selectedProviderInModal]?.extraField)
    apiKeys[selectedProviderInModal+'_extra']=document.getElementById('api-extra-input').value.trim();
  localStorage.setItem('voz_apikeys',JSON.stringify(apiKeys));
  currentProvider=selectedProviderInModal;
  apiKey=key;
  localStorage.setItem('voz_provider',currentProvider);
  closeApiModal();
  updateApiStatus();
  loadVoicesForProvider();
  updateProviderBanner();
  toast('✅ Proveedor conectado: '+PROVIDERS[currentProvider].name);
}

function toggleKeyVis(){
  const inp=document.getElementById('api-key-input');
  inp.type=inp.type==='password'?'text':'password';
}

function updateApiStatus(){
  const chip=document.getElementById('api-chip');
  const dot=document.getElementById('api-dot');
  const lbl=document.getElementById('api-label');
  const badge=document.getElementById('api-provider-badge');
  apiKey=apiKeys[currentProvider]||'';
  const p=PROVIDERS[currentProvider];
  if(apiKey||p?.noKeyRequired){
    chip.classList.add('ok');
    dot.style.background=p?.color||'var(--green)';
    dot.style.boxShadow='0 0 6px '+(p?.color||'var(--green)');
    lbl.textContent='Conectado';
    if(badge){badge.textContent=p?.name||'';badge.style.color=p?.color||'var(--green)';}
  } else {
    chip.classList.remove('ok');
    dot.style.background='var(--t3)';dot.style.boxShadow='none';
    lbl.textContent='Conectar API de voz';
    if(badge) badge.textContent='';
  }
}

function updateProviderBanner(){
  const p=PROVIDERS[currentProvider];
  if(!p) return;
  const bannerEmoji=document.getElementById('banner-emoji');
  const bannerName=document.getElementById('banner-name');
  const bannerFree=document.getElementById('banner-free');
  const providerBanner=document.getElementById('provider-banner');
  if(bannerEmoji) bannerEmoji.textContent=p.emoji;
  if(bannerName) bannerName.textContent=p.name+(apiKeys[currentProvider]?' ✓':' — sin key');
  if(bannerFree) bannerFree.textContent=p.free;
  if(providerBanner) providerBanner.style.borderColor=apiKeys[currentProvider]?'rgba(61,214,140,.3)':'var(--b2)';
}

// ═══════════════════════════════════════════
//  INDEXEDDB — file content storage
// ═══════════════════════════════════════════
let _idb=null;
function getIDB(){
  if(_idb) return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    const req=indexedDB.open('audioteka_files',1);
    req.onupgradeneeded=e=>{
      e.target.result.createObjectStore('files');
    };
    req.onsuccess=e=>{_idb=e.target.result;res(_idb);};
    req.onerror=()=>rej(req.error);
  });
}
async function idbSet(key,value){
  const db=await getIDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction('files','readwrite');
    tx.objectStore('files').put(value,key);
    tx.oncomplete=()=>res();
    tx.onerror=()=>rej(tx.error);
  });
}
async function idbGet(key){
  const db=await getIDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction('files','readonly');
    const req=tx.objectStore('files').get(key);
    req.onsuccess=()=>res(req.result||null);
    req.onerror=()=>rej(req.error);
  });
}
async function idbDel(key){
  const db=await getIDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction('files','readwrite');
    tx.objectStore('files').delete(key);
    tx.oncomplete=()=>res();
    tx.onerror=()=>rej(tx.error);
  });
}

function saveBooks(){
  const slim = books.map(b => ({...b, coverData: null}));
  try{
    localStorage.setItem('atk_books', JSON.stringify(slim));
  } catch(e2) { console.error('localStorage full!', e2); }
}

async function loadCoversFromIDB(){
  for(const book of books){
    if(book.coverData) continue;
    const key = book.epubKey ? 'cover_'+book.epubKey : null;
    if(!key) continue;
    try{
      const data = await idbGet(key);
      if(data) book.coverData = data;
    }catch(e){}
  }
  renderBooks();
}
function saveCategories(){ localStorage.setItem('atk_cats',JSON.stringify(categories)); }

// ═══════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════
function escHtml(s){ return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function toast(msg,duration=2800){
  const el=document.getElementById('toast');
  el.textContent=msg;el.classList.add('show');
  clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),duration);
}

// ═══════════════════════════════════════════
//  PWA
// ═══════════════════════════════════════════
function registerSW(){
  if(!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    console.log('SW registered', reg.scope);
    setInterval(()=>reg.active?.postMessage('keepAlive'),20000);
    navigator.serviceWorker.addEventListener('message', e=>{
      if(e.data==='swReady') console.log('SW ready for background audio');
    });
  }).catch(e=>console.warn('SW failed — audio may stop in background:',e));
}

// ═══════════════════════════════════════════
//  EXPORT LIBRARY PAGE
// ═══════════════════════════════════════════
function exportLibraryPage(){
  const catMap = {};
  categories.forEach(c => catMap[c.id] = c);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mi Biblioteca — ${books.length} libros</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07070f;--s1:#0c0c16;--s2:#121220;--s3:#1a1a2c;--s4:#222238;
  --b1:rgba(255,255,255,.05);--b2:rgba(255,255,255,.08);--b3:rgba(255,255,255,.15);
  --t1:#f0eef8;--t2:#9490a8;--t3:#4e4a68;
  --gold:#d4a843;--gold2:#e8c06a;--gold3:#b8922d;--gold-g:rgba(212,168,67,.12);
  --sans:'DM Sans',system-ui,sans-serif;
  --serif:'Cormorant Garamond',Georgia,serif;
}
html{scroll-behavior:smooth;height:100%}
body{
  font-family:var(--sans);
  background:var(--bg);
  color:var(--t1);
  min-height:100%;
  display:flex;
  flex-direction:column;
  overflow-x:hidden;
  position:relative;
}
body::before{
  content:'';position:fixed;inset:0;
  background:
    radial-gradient(circle at 10% 20%, rgba(99,102,241,.12), transparent 45%),
    radial-gradient(circle at 90% 80%, rgba(212,168,67,.08), transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(26,26,44,.5), transparent);
  pointer-events:none;z-index:0;
}
body::after{
  content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
  pointer-events:none;z-index:0;
  opacity:.6;
}

#app-layout{
  display:flex;
  flex:1;
  width:100%;
  max-width:1600px;
  margin:0 auto;
  position:relative;
  z-index:1;
}

aside{
  width:300px;
  min-width:300px;
  padding:40px 24px;
  border-right:1px solid var(--b1);
  background:rgba(12,12,22,.5);
  backdrop-filter:blur(20px);
  height:100vh;
  position:sticky;top:0;
  display:flex;flex-direction:column;gap:28px;
  overflow-y:auto;
}
aside::-webkit-scrollbar{width:3px}
aside::-webkit-scrollbar-thumb{background:var(--s4);border-radius:2px}

.brand-section h1{
  font-family:var(--serif);
  font-size:28px;
  font-weight:700;
  background:linear-gradient(135deg,#fff 30%,var(--gold2));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  margin-bottom:4px;
}
.brand-sub{font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:1px}

.search-box{
  position:relative;
}
.search-box input{
  width:100%;
  padding:12px 16px;
  padding-left:42px;
  background:var(--s2);
  border:1px solid var(--b1);
  border-radius:12px;
  color:var(--t1);
  font-family:var(--sans);
  font-size:13.5px;
  outline:none;
  transition:all .2s;
}
.search-box input:focus{border-color:var(--gold);box-shadow:0 0 10px rgba(212,168,67,.1)}
.search-box::before{
  content:'🔍';
  position:absolute;left:14px;top:50%;
  transform:translateY(-50%);
  font-size:14px;opacity:.5;
}

.filter-section-title{
  font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--t3);margin-bottom:12px;
}
.filter-menu{display:flex;flex-direction:column;gap:6px}
.flt-btn{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;border-radius:10px;border:none;
  background:transparent;color:var(--t2);cursor:pointer;
  transition:all .15s;font-family:var(--sans);font-size:13.5px;font-weight:500;
}
.flt-btn:hover{background:var(--b1);color:var(--t1)}
.flt-btn.active{background:var(--gold-g);color:var(--gold2);font-weight:600}
.flt-badge{
  font-size:10px;font-family:monospace;background:var(--s3);color:var(--t3);padding:2px 6px;border-radius:20px;
}
.flt-btn.active .flt-badge{background:var(--gold);color:#000;font-weight:700}

.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat-card{
  background:rgba(255,255,255,.02);
  border:1px solid var(--b1);
  border-radius:12px;padding:12px;
  text-align:center;
}
.stat-num{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--gold);display:block}
.stat-label{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px}

main{
  flex:1;
  padding:40px 48px;
  display:flex;flex-direction:column;gap:32px;
  min-width:0;
}

.hero-banner{
  background:linear-gradient(135deg, rgba(20,20,35,.6), rgba(10,10,20,.6));
  border:1px solid var(--b1);
  border-radius:20px;
  padding:36px;
  backdrop-filter:blur(10px);
  position:relative;
  overflow:hidden;
}
.hero-banner::after{
  content:'';position:absolute;top:-50%;right:-20%;width:300px;height:300px;
  background:radial-gradient(circle, rgba(212,168,67,.1) 0%, transparent 70%);
  pointer-events:none;
}
.hero-banner h2{font-family:var(--serif);font-size:32px;font-weight:600;margin-bottom:8px}
.hero-banner p{font-size:14px;color:var(--t2);line-height:1.6;max-width:560px}

.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));
  gap:24px;
  padding-bottom:60px;
}

.card{
  background:rgba(18,18,32,.75);
  border:1px solid var(--b1);
  border-radius:16px;
  overflow:hidden;
  cursor:pointer;
  transition:all .3s cubic-bezier(.25, .8, .25, 1);
  position:relative;
  display:flex;flex-direction:column;
  height:100%;
  box-shadow:0 8px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05);
  border-left:1px solid rgba(255,255,255,.08);
}
.card:hover{
  transform:translateY(-8px) scale(1.02);
  border-color:var(--gold);
  box-shadow:0 20px 40px rgba(0,0,0,.6), 0 0 15px rgba(212,168,67,.2);
}
.card::after{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
  transform:translateX(-100%);
  transition:transform .6s ease;
  pointer-events:none;
}
.card:hover::after{transform:translateX(100%)}

.card-cover-wrap{
  width:100%;aspect-ratio:2/3;
  position:relative;overflow:hidden;
  background:var(--s3);
  flex-shrink:0;
}
.card-cover-wrap img{
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s;
}
.card:hover .card-cover-wrap img{transform:scale(1.04)}

.card-ph{
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
}
.card-ph span{font-family:var(--serif);font-size:48px;font-weight:700;opacity:.8}

.card-status-badge{
  position:absolute;top:8px;right:8px;
  width:22px;height:22px;border-radius:6px;
  background:rgba(8,8,16,.75);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;z-index:2;border:1px solid var(--b1);
}
.card-fav-badge{
  position:absolute;top:8px;left:8px;
  width:22px;height:22px;border-radius:6px;
  background:rgba(8,8,16,.75);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;z-index:2;
}

.card-info{
  padding:14px 12px;
  display:flex;flex-direction:column;
  flex:1;justify-content:space-between;
  gap:8px;
  background:linear-gradient(to top,var(--s1),var(--s2));
}
.card-title{
  font-family:var(--serif);font-size:14.5px;font-weight:600;
  color:var(--t1);line-height:1.35;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
  margin-bottom:2px;
}
.card-author{font-size:10.5px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.card-meta{display:flex;align-items:center;justify-content:space-between;font-size:9.5px;margin-top:auto}
.card-cat-badge{
  font-weight:700;letter-spacing:.3px;text-transform:uppercase;
  padding:2px 6px;border-radius:4px;border:1px solid transparent;
}
.card-stars{color:var(--gold);font-family:monospace;letter-spacing:.5px}

footer{
  text-align:center;
  padding:40px 0 60px;
  color:var(--t3);font-size:11px;letter-spacing:.5px;
  border-top:1px solid var(--b1);
  margin-top:auto;
}
footer span{color:var(--gold)}

.modal-overlay{
  position:fixed;inset:0;
  background:rgba(4,4,8,.85);
  z-index:1000;
  display:none;align-items:center;justify-content:center;
  padding:20px;backdrop-filter:blur(10px);
  opacity:0;transition:opacity .3s ease;
}
.modal-overlay.visible{display:flex;opacity:1}
.modal-overlay.visible .modal{transform:scale(1);opacity:1}

.modal{
  background:var(--s2);
  border:1px solid var(--b2);
  border-radius:24px;
  width:100%;max-width:680px;
  max-height:85vh;overflow-y:auto;
  position:relative;
  display:flex;flex-direction:column;
  box-shadow:0 30px 70px rgba(0,0,0,.8);
  transform:scale(.96);opacity:0;
  transition:all .3s cubic-bezier(.25, .8, .25, 1);
}
.modal::-webkit-scrollbar{width:4px}
.modal::-webkit-scrollbar-thumb{background:var(--s4);border-radius:2px}

.modal-inner{padding:32px;display:flex;flex-direction:column;gap:24px}
.modal-close{
  position:absolute;top:20px;right:20px;
  width:32px;height:32px;border-radius:8px;
  border:1px solid var(--b2);background:transparent;
  color:var(--t2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;font-size:13px;z-index:10;
}
.modal-close:hover{border-color:var(--gold);color:var(--gold)}

.modal-hero{display:flex;gap:24px;align-items:flex-start}
.modal-cover{
  width:140px;aspect-ratio:2/3;border-radius:12px;overflow:hidden;
  background:var(--s3);border:1px solid var(--b2);box-shadow:0 10px 20px rgba(0,0,0,.3);
  flex-shrink:0;
}
.modal-cover img{width:100%;height:100%;object-fit:cover;display:block}
.modal-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:48px}

.modal-details{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.modal-tags{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tag-badge{
  font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;
  padding:2px 7px;border-radius:4px;border:1px solid transparent;
}
.tag-badge.gold{background:rgba(212,168,67,.12);color:var(--gold);border-color:rgba(212,168,67,.2)}

.modal-title{font-family:var(--serif);font-size:24px;font-weight:600;line-height:1.25;color:var(--t1)}
.modal-author{font-size:14px;color:var(--t2)}
.modal-stars{color:var(--gold);font-size:15px;letter-spacing:1px}

.modal-meta-grid{
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;
  margin-top:6px;
}
.meta-item{background:var(--s3);border-radius:10px;padding:10px;border:1px solid var(--b1)}
.meta-lbl{display:block;font-size:8.5px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.meta-val{font-size:11.5px;color:var(--t1);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}

.tabs-header{display:flex;gap:3px;background:var(--s3);border-radius:10px;padding:3px}
.tab-btn{
  flex:1;padding:8px;border-radius:8px;border:none;background:transparent;
  color:var(--t3);font-family:var(--sans);font-size:12px;font-weight:600;
  cursor:pointer;transition:all .15s;text-align:center;
}
.tab-btn:hover{color:var(--t2)}
.tab-btn.active{background:var(--s2);color:var(--t1);box-shadow:0 2px 6px rgba(0,0,0,.2)}

.tab-content{min-height:140px;max-height:260px;overflow-y:auto;padding-right:4px}
.tab-content::-webkit-scrollbar{width:3px}
.tab-content::-webkit-scrollbar-thumb{background:var(--s4);border-radius:2px}

.tab-pane{display:none;font-size:13.5px;line-height:1.8;color:rgba(240,238,248,.8)}
.tab-pane.active{display:block}
.notes-view{white-space:pre-wrap;font-style:italic;color:rgba(240,238,248,.75);padding-left:12px;border-left:2px solid var(--gold)}

@media(max-width:900px){
  #app-layout{flex-direction:column}
  aside{
    width:100%;min-width:100%;height:auto;
    position:relative;border-right:none;border-bottom:1px solid var(--b1);
    padding:30px 20px 20px;gap:20px;
  }
  main{padding:24px 20px}
  .hero-banner{padding:24px}
}
@media(max-width:550px){
  .modal-hero{flex-direction:column;align-items:center;text-align:center}
  .modal-cover{width:120px}
  .modal-meta-grid{grid-template-columns:1fr}
  .grid{grid-template-columns:1fr 1fr;gap:14px}
  .hero-banner h2{font-size:24px}
}
</style>
</head>
<body>
<div id="app-layout">

  <aside>
    <div class="brand-section">
      <h1>Mi Biblioteca</h1>
      <div class="brand-sub">Colección Personal</div>
    </div>

    <div class="search-box">
      <input type="text" id="search-input" placeholder="Buscar título o autor…" autocomplete="off" oninput="handleSearch(this.value)">
    </div>

    <div>
      <div class="filter-section-title">Resumen</div>
      <div class="stats-grid">
        <div class="stat-card"><span class="stat-num" id="stat-count-total">0</span><span class="stat-label">Libros</span></div>
        <div class="stat-card"><span class="stat-num" id="stat-count-read">0</span><span class="stat-label">Leídos</span></div>
      </div>
    </div>

    <div>
      <div class="filter-section-title">Estados</div>
      <nav class="filter-menu">
        <button class="flt-btn active" id="flt-all" onclick="setStatusFilter('all')">
          <span>📚 Todos</span><span class="flt-badge" id="badge-all">0</span>
        </button>
        <button class="flt-btn" id="flt-reading" onclick="setStatusFilter('reading')">
          <span>📖 Leyendo ahora</span><span class="flt-badge" id="badge-reading">0</span>
        </button>
        <button class="flt-btn" id="flt-read" onclick="setStatusFilter('read')">
          <span>✅ Leídos</span><span class="flt-badge" id="badge-read">0</span>
        </button>
        <button class="flt-btn" id="flt-unread" onclick="setStatusFilter('unread')">
          <span>📋 Pendientes</span><span class="flt-badge" id="badge-unread">0</span>
        </button>
        <button class="flt-btn" id="flt-fav" onclick="setStatusFilter('fav')">
          <span>❤️ Favoritos</span><span class="flt-badge" id="badge-fav">0</span>
        </button>
      </nav>
    </div>

    <div>
      <div class="filter-section-title">Categorías</div>
      <nav class="filter-menu" id="categories-menu"></nav>
    </div>
  </aside>

  <main>
    <div class="hero-banner">
      <h2 id="view-title">Todos los libros</h2>
      <p id="view-desc">Colección completa de lecturas importadas y organizadas en mi biblioteca digital.</p>
    </div>

    <div class="grid" id="books-grid"></div>
  </main>
</div>

<div class="modal-overlay" id="modal-overlay" onclick="closeDetails(event)">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeDetails()">✕</button>
    <div class="modal-inner">
      <div class="modal-hero">
        <div class="modal-cover" id="modal-cover"></div>
        <div class="modal-details">
          <div class="modal-tags">
            <span class="tag-badge" id="modal-cat">Categoría</span>
            <span class="tag-badge gold" id="modal-status">Estado</span>
          </div>
          <h2 class="modal-title" id="modal-title">Título del Libro</h2>
          <p class="modal-author" id="modal-author">Autor del Libro</p>
          <div class="modal-stars" id="modal-stars">⭐⭐⭐⭐⭐</div>
          
          <div class="modal-meta-grid">
            <div class="meta-item"><span class="meta-lbl">Editorial</span><span class="meta-val" id="modal-publisher">—</span></div>
            <div class="meta-item"><span class="meta-lbl">Idioma</span><span class="meta-val" id="modal-lang">—</span></div>
            <div class="meta-item"><span class="meta-lbl">Añadido</span><span class="meta-val" id="modal-added">—</span></div>
          </div>
        </div>
      </div>

      <div class="tabs-header">
        <button class="tab-btn active" id="tab-btn-desc" onclick="switchTab('desc')">Sinopsis</button>
        <button class="tab-btn" id="tab-btn-notes" onclick="switchTab('notes')">Notas Personales</button>
      </div>

      <div class="tab-content">
        <div class="tab-pane active" id="tab-desc"></div>
        <div class="tab-pane" id="tab-notes"></div>
      </div>
    </div>
  </div>
</div>

<script>
const books = ${JSON.stringify(books)};
const categories = ${JSON.stringify(categories)};

const catMap = {};
categories.forEach(c => catMap[c.id] = c);

let activeStatus = 'all';
let activeCatId = null;
let searchQuery = '';

function init(){
  renderCategories();
  updateStats();
  renderGrid();
}

function updateStats(){
  const total = books.length;
  const read = books.filter(b => b.status === 'read').length;
  const reading = books.filter(b => b.status === 'reading').length;
  const unread = books.filter(b => b.status === 'unread').length;
  const fav = books.filter(b => b.favorite).length;

  document.getElementById('stat-count-total').textContent = total;
  document.getElementById('stat-count-read').textContent = read;
  
  document.getElementById('badge-all').textContent = total;
  document.getElementById('badge-reading').textContent = reading;
  document.getElementById('badge-read').textContent = read;
  document.getElementById('badge-unread').textContent = unread;
  document.getElementById('badge-fav').textContent = fav;
}

function renderCategories(){
  const menu = document.getElementById('categories-menu');
  menu.innerHTML = categories.map(cat => {
    const count = books.filter(b => b.catId === cat.id).length;
    return `<button class="flt-btn" id="flt-cat-${cat.id}" onclick="setCategoryFilter('${cat.id}')">
      <span><span style="color:${cat.color}; margin-right: 6px;">●</span>${cat.name}</span>
      <span class="flt-badge">${count}</span>
    </button>`;
  }).join('');
}

function setStatusFilter(status){
  activeStatus = status;
  activeCatId = null;
  searchQuery = '';
  document.getElementById('search-input').value = '';
  
  document.querySelectorAll('.filter-menu .flt-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('flt-' + status).classList.add('active');
  
  const titles = {
    all: 'Todos los libros',
    reading: 'Leyendo ahora',
    read: 'Libros Leídos',
    unread: 'Libros Pendientes',
    fav: 'Mis Favoritos'
  };
  document.getElementById('view-title').textContent = titles[status] || 'Libros';
  document.getElementById('view-desc').textContent = 'Filtro por estado: ' + (titles[status]?.toLowerCase() || 'todos');

  renderGrid();
}

function setCategoryFilter(catId){
  activeStatus = null;
  activeCatId = catId;
  searchQuery = '';
  document.getElementById('search-input').value = '';
  
  document.querySelectorAll('.filter-menu .flt-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById('flt-cat-' + catId);
  if(btn) btn.classList.add('active');
  
  const cat = catMap[catId];
  if(cat){
    document.getElementById('view-title').textContent = cat.name;
    document.getElementById('view-desc').textContent = 'Todos los libros de la categoría ' + cat.name;
  }
  renderGrid();
}

function handleSearch(q){
  searchQuery = q.trim();
  renderGrid();
}

function renderGrid(){
  const grid = document.getElementById('books-grid');
  let filtered = [...books];

  if(searchQuery){
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(b => 
      (b.title||'').toLowerCase().includes(q) || 
      (b.author||'').toLowerCase().includes(q)
    );
  }

  if(activeCatId){
    filtered = filtered.filter(b => b.catId === activeCatId);
  }

  if(activeStatus && activeStatus !== 'all'){
    if(activeStatus === 'fav') filtered = filtered.filter(b => b.favorite);
    else filtered = filtered.filter(b => b.status === activeStatus);
  }

  if(!filtered.length){
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 60px 20px; color: var(--t3);">
      <div style="font-size:48px; margin-bottom: 12px;">📚</div>
      <h3>No se encontraron libros</h3>
      <p style="font-size:12px; margin-top:4px;">Prueba cambiando tus términos de búsqueda o filtros.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(b => {
    const cat = catMap[b.catId];
    const catName = cat ? cat.name : 'Sin categoría';
    const catColor = cat ? cat.color : '#4e4a68';
    const stars = b.rating ? '★'.repeat(b.rating) + '☆'.repeat(5-b.rating) : '☆☆☆☆☆';
    
    let coverHtml;
    if(b.coverData){
      coverHtml = `<img src="${b.coverData}" alt="" loading="lazy">`;
    } else {
      const initial = (b.title||'?')[0].toUpperCase();
      coverHtml = `<div class="card-ph" style="background:${catColor}22; color:${catColor}"><span>${initial}</span></div>`;
    }

    const statusEmoji = {unread:'📋',reading:'📖',read:'✅'}[b.status]||'📋';

    return `<div class="card" onclick="openDetails('${b.id}')">
      <div class="card-cover-wrap">
        ${coverHtml}
        <div class="card-status-badge">${statusEmoji}</div>
        ${b.favorite ? '<div class="card-fav-badge">❤️</div>' : ''}
      </div>
      <div class="card-info">
        <div>
          <div class="card-title">${escapeHtml(b.title||'Sin título')}</div>
          <div class="card-author">${escapeHtml(b.author||'Autor desconocido')}</div>
        </div>
        <div class="card-meta">
          <span class="card-cat-badge" style="background:${catColor}15; color:${catColor}; border-color:${catColor}33">${catName}</span>
          <span class="card-stars">${stars}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function getBookProgress(book){
  const ch = parseInt(localStorage.getItem('atk_ch_'+book.epubKey)||'0');
  const total = parseInt(localStorage.getItem('atk_chtotal_'+book.epubKey)||'0');
  if(!total) return 0;
  return Math.round((ch/total)*100);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function openDetails(bookId){
  const book = books.find(b => b.id === bookId);
  if(!book) return;

  const cat = catMap[book.catId];
  const catName = cat ? cat.name : 'Sin categoría';
  const catColor = cat ? cat.color : '#4e4a68';

  const img = document.getElementById('modal-cover');
  if(book.coverData){
    img.innerHTML = `<img src="${book.coverData}" alt="">`;
  } else {
    img.innerHTML = `<div class="modal-ph" style="background:${catColor}22; color:${catColor}">${(book.title||'?')[0].toUpperCase()}</div>`;
  }

  document.getElementById('modal-title').textContent = book.title || 'Sin título';
  document.getElementById('modal-author').textContent = book.author || 'Autor desconocido';
  
  const badge = document.getElementById('modal-cat');
  badge.textContent = catName;
  badge.style.background = cat ? cat.color+'22' : '';
  badge.style.color = cat ? cat.color : 'var(--t3)';
  badge.style.borderColor = cat ? cat.color+'44' : '';

  const statusLabel = {unread:'📋 Pendiente', reading:'📖 Leyendo', read:'✅ Leído'}[book.status]||'📋 Pendiente';
  document.getElementById('modal-status').textContent = statusLabel;

  const ratingStars = book.rating ? '★'.repeat(book.rating) + '☆'.repeat(5-book.rating) : '☆☆☆☆☆';
  document.getElementById('modal-stars').textContent = ratingStars;

  document.getElementById('modal-publisher').textContent = book.publisher || '—';
  document.getElementById('modal-lang').textContent = book.lang || '—';
  document.getElementById('modal-added').textContent = book.added ? new Date(book.added).toLocaleDateString('es-ES') : '—';

  document.getElementById('tab-desc').textContent = book.desc || 'Sin sinopsis disponible.';
  
  const notesNode = document.getElementById('tab-notes');
  if(book.notes){
    notesNode.className = 'tab-pane notes-view';
    notesNode.textContent = book.notes;
  } else {
    notesNode.className = 'tab-pane';
    notesNode.textContent = 'Sin notas guardadas para este libro.';
  }

  switchTab('desc');

  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => overlay.classList.add('visible'), 10);
}

function closeDetails(e){
  if(e && e.target !== document.getElementById('modal-overlay') && e.target.className !== 'modal-close') return;
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('visible');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
}

function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  document.getElementById('tab-btn-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);
</script>
