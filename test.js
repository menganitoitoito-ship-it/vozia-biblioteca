const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock localStorage
window.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; }
};

// Mock SpeechSynthesis
window.speechSynthesis = {
  getVoices: () => [{lang: 'es-ES', name: 'Google Español', voiceURI: 'g1'}],
  cancel: () => {},
  speak: (utt) => {
    console.log("SPEAK CALLED with text:", utt.text.substring(0, 30));
    setTimeout(() => { if (utt.onend) utt.onend(); }, 100);
  }
};
window.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; }
};

// Mock URL
window.URL = { createObjectURL: () => 'blob:abc' };

// Mock audio
window.Audio = class {
  play() { return Promise.resolve(); }
  pause() {}
};

setTimeout(() => {
  try {
    // Populate dummy data
    window.epubChapters = [
      { title: 'Chapter 1', content: 'Hello world\nThis is paragraph 2.\nAnd paragraph 3.' }
    ];
    window.currentChapter = 0;
    window.currentEpubKey = 'testbook';
    
    // Simulate showChapter to populate the DOM
    window.showChapter(0);
    
    // Simulate clicking Read
    console.log("Total paras before read:", window.currentTotalParas);
    window.readCurrentChapter();
    
    setTimeout(() => {
      console.log("Current para index:", window.currentParaIndex);
      const paras = document.querySelectorAll('.reader-para.speaking');
      console.log("Speaking paragraphs count:", paras.length);
    }, 200);

  } catch(e) {
    console.error(e);
  }
}, 500);
