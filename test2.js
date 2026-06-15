const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let html = fs.readFileSync('index.html', 'utf8');

// Inject test code at the end of the body
const testScript = `
<script>
  setTimeout(() => {
    try {
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
      
      currentProvider = 'webspeech';
      epubChapters = [
        { title: 'Chapter 1', content: 'Hello world\\nThis is paragraph 2.\\nAnd paragraph 3.' }
      ];
      currentChapter = 0;
      currentEpubKey = 'testbook';
      
      showChapter(0);
      console.log("Total paras before read:", currentTotalParas);
      readCurrentChapter();
      
      setTimeout(() => {
        console.log("Current para index:", currentParaIndex);
        const paras = document.querySelectorAll('.reader-para.speaking');
        console.log("Speaking paragraphs count:", paras.length);
        if (paras.length > 0) {
          console.log("Highlighting works!");
        } else {
          console.log("Highlighting failed.");
        }
      }, 200);
    } catch(e) {
      console.error("Test Error:", e);
    }
  }, 1000);
</script>
`;
html = html.replace('</body>', testScript + '</body>');

const dom = new JSDOM(html, { url: "http://localhost", runScripts: "dangerously" });
const window = dom.window;

// Intercept console.log
window.console.log = (...args) => console.log("DOM:", ...args);
window.console.error = (...args) => console.error("DOM ERR:", ...args);

setTimeout(() => process.exit(0), 3000);
