
/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PROFIT REPORT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function parseInput(text) {
  const sections = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^(Equity|Futures?|Options?|Commodity)\s*:?\s*$/i.test(line)) {
      let secName = line.replace(/\s*:?\s*$/, '').toUpperCase();
      if (secName === 'FUTURE') secName = 'FUTURES';
      if (secName === 'OPTION') secName = 'OPTIONS';
      cur = { name: secName, rows: [] };
      sections.push(cur);
      continue;
    }
    if (!cur) continue;
    const moreMatch = line.match(/^[+&]\s*(\d+)\s+more/i);
    if (moreMatch) { cur.more = '+' + moreMatch[1] + ' more'; continue; }
    const m = line.match(/^(.+?):\s*(.+?)\s+(?:in\s+|on\s+)(.+)$/i);
    if (m) {
      let stockName = m[1].trim().toUpperCase();
      let ret = m[2].trim();
      let durationStr = m[3].trim();
      
      // Auto-formatting duration
      durationStr = durationStr.replace(/^(?:the\s+)?same day$/i, 'Same Day');
      durationStr = durationStr.replace(/^(?:just|only|the)\s+/i, '');
      let finalDuration = durationStr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      if (/futures/i.test(cur.name)) {
        if (!ret.includes('₹')) {
          ret = ret.startsWith('-') ? '-₹' + ret.slice(1).trim() : '₹' + ret;
        }
      } else {
        if (!ret.includes('%')) ret = ret + '%';
      }
      cur.rows.push({ name: stockName, returns: ret, duration: finalDuration });
    }
  }
  return sections;
}

const COL_HEADERS = {
  'EQUITY':    ['STOCK NAME', 'RETURNS',          'DURATION'],
  'FUTURES':   ['STOCK NAME', 'RETURNS/LOT',      'DURATION'],
  'OPTIONS':   ['STOCK NAME', 'RETURNS/STRATEGY', 'DURATION'],
  'COMMODITY': ['STOCK NAME', 'RETURNS',          'DURATION'],
};

let generateTimeout;
function generate() {
  clearTimeout(generateTimeout);
  generateTimeout = setTimeout(doGenerate, 15);
}

let customLogoData = null;
let customLogoPos = 'top-left';

function doGenerate() {
  const text     = document.getElementById('inputText').value;
  const sections = parseInput(text);
  const W        = parseInt(document.getElementById('cardWidth').value);
  const userScale= parseInt(document.getElementById('overallScale').value) / 100;
  const headScale= parseInt(document.getElementById('headingScale').value) / 100;
  const tblSpace = parseInt(document.getElementById('tableSpacing').value) / 100;
  const fontFam  = document.getElementById('fontFamily').value;
  const sebi     = document.getElementById('sebiReg').value;
  const disc     = document.getElementById('disclaimer').value;

  const totalRows = sections.reduce((s, sec) => s + sec.rows.length + (sec.more ? parseInt(sec.more) : 0), 0);
  const S         = sections.length;

  const BASE = {
    padTB: 0.040, padLR: 0.050, sebiFz: 0.019, sebiMb: 0.010,
    titleFz: 0.080 * headScale, titleMb: 0.030 * headScale, secFz: 0.021, secMt: 0.025,
    secMb: 0.010, thFz: 0.019, thPad: 0.014, tdFz: 0.022,
    tdPad: 0.012, discFz: 0.013, discMt: 0.028,
  };

  const px = (frac) => frac * W;
  const naturalH =
    px(BASE.padTB) * 2 +
    px(BASE.sebiFz) + px(BASE.sebiMb) +
    px(BASE.titleFz) * 1.1 + px(BASE.titleMb) +
    S * (px(BASE.secFz) + px(BASE.secMt) + px(BASE.secMb) +
         px(BASE.thFz) + px(BASE.thPad) * 2) +
    totalRows * (px(BASE.tdFz) + px(BASE.tdPad) * 2) +
    px(BASE.discFz) * 3 + px(BASE.discMt);

  const format = document.getElementById('cardFormat').value;
  let formatMaxH = W * 1.25;
  if (format === '1:1') formatMaxH = W;
  else if (format === '9:16') formatMaxH = W * (16 / 9);
  else if (format === '16:9') formatMaxH = W * (9 / 16);

  const autoScale = naturalH > formatMaxH ? formatMaxH / naturalH : 1;
  const scale = autoScale * userScale;

  const sz = {};
  for (const k in BASE) sz[k] = Math.max(1, Math.round(px(BASE[k]) * scale));

  const card = document.getElementById('card');
  card.style.width = W + 'px';
  card.style.fontFamily = fontFam;

  const inner = document.getElementById('cardInner');
  inner.style.padding = sz.padTB + 'px ' + sz.padLR + 'px';
  if (format !== 'auto') {
    card.style.height = formatMaxH + 'px';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    inner.style.justifyContent = 'center';
    inner.style.height = '100%';
  } else {
    card.style.height = 'auto';
    inner.style.display = 'block';
  }

  const sebiEl = document.getElementById('sebiLine');
  sebiEl.textContent = 'SEBI Reg. : ' + sebi;
  sebiEl.style.fontSize = sz.sebiFz + 'px';
  sebiEl.style.marginBottom = sz.sebiMb + 'px';
  sebiEl.contentEditable = "true";

  const titleBlock = document.getElementById('titleBlock');
  titleBlock.style.marginBottom = sz.titleMb + 'px';
  titleBlock.innerHTML =
    '<span class="t-green" style="font-size:' + sz.titleFz + 'px">' + totalRows + ' Profits </span>' +
    '<span class="t-white" style="font-size:' + sz.titleFz + 'px">Booked Today</span>';
  titleBlock.contentEditable = "true";

  const discEl = document.getElementById('disclaimerDisplay');
  discEl.textContent = disc;
  discEl.style.fontSize = sz.discFz + 'px';
  discEl.style.marginTop = sz.discMt + 'px';
  discEl.contentEditable = "true";

  const container = document.getElementById('tablesContainer');
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  if (customLogoData) {
    const logoImg = document.createElement('img');
    logoImg.src = customLogoData;
    logoImg.className = 'card-logo ' + customLogoPos;
    logoImg.style.transform = `scale(${scale})`;
    logoImg.style.transformOrigin = customLogoPos.includes('left') ? 'top left' : (customLogoPos.includes('right') ? 'top right' : 'bottom center');
    fragment.appendChild(logoImg);
  }

  const ORDER = { 'EQUITY': 0, 'OPTIONS': 1, 'FUTURES': 2, 'COMMODITY': 3 };
  sections.sort((a, b) => (ORDER[a.name] ?? 99) - (ORDER[b.name] ?? 99));

  for (const sec of sections) {
    const label = document.createElement('div');
    label.className = 'card-section';
    label.style.fontSize = sz.secFz + 'px';
    label.style.marginTop = Math.round(sz.secMt * tblSpace) + 'px';
    label.style.marginBottom = sz.secMb + 'px';
    label.textContent = sec.name;
    label.contentEditable = "true";
    fragment.appendChild(label);

    const headers = COL_HEADERS[sec.name] || COL_HEADERS['EQUITY'];
    const table = document.createElement('table');
    table.className = 'card-table';

    const colgroup = document.createElement('colgroup');
    ['c-name','c-ret','c-dur'].forEach(cls => {
      const col = document.createElement('col');
      col.className = cls;
      colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    const thead = document.createElement('thead');
    const htr = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      th.style.fontSize = sz.thFz + 'px';
      th.style.padding = sz.thPad + 'px ' + Math.round(sz.padLR * 0.4) + 'px';
      th.contentEditable = "true";
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const row of sec.rows) {
      const tr = document.createElement('tr');
      const tdN = document.createElement('td'); tdN.className = 'td-name';     tdN.textContent = row.name; tdN.contentEditable = "true";
      const tdR = document.createElement('td'); tdR.className = 'td-returns';  tdR.textContent = row.returns; tdR.contentEditable = "true";
      const tdD = document.createElement('td'); tdD.className = 'td-duration'; tdD.textContent = row.duration; tdD.contentEditable = "true";
      [tdN, tdR, tdD].forEach(td => {
        td.style.fontSize = sz.tdFz + 'px';
        td.style.padding = sz.tdPad + 'px ' + Math.round(sz.padLR * 0.4) + 'px';
      });
      tr.append(tdN, tdR, tdD);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    table.style.marginBottom = '0px';
    fragment.appendChild(table);

    if (sec.more) {
      const moreEl = document.createElement('div');
      moreEl.textContent = sec.more;
      moreEl.style.textAlign = 'center';
      moreEl.style.color = 'var(--color-secondary)';
      moreEl.style.opacity = '0.45';
      moreEl.style.fontSize = Math.round(sz.tdFz * 0.78) + 'px';
      moreEl.style.fontStyle = 'italic';
      moreEl.style.letterSpacing = '0.5px';
      moreEl.style.marginBottom = Math.round(sz.secMt * tblSpace) + 'px';
      moreEl.style.marginTop = Math.round(sz.tdPad * 0.8) + 'px';
      moreEl.contentEditable = "true";
      fragment.appendChild(moreEl);
    } else {
      table.style.marginBottom = Math.round(sz.secMt * (tblSpace - 1)) + 'px';
    }
  }
  container.appendChild(fragment);
}

function download() {
  html2canvas(document.getElementById('card'), {
    scale: 2, backgroundColor: null, useCORS: true
  }).then(canvas => {
    const a = document.createElement('a');
    let customName = document.getElementById('fileName').value.trim();
    if (!customName) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const d = new Date();
      customName = `Univest_Stock Performance Page_Static Post ${d.getDate()} ${months[d.getMonth()]}`;
    }
    a.download = customName + '.jpg';
    a.href = canvas.toDataURL('image/jpeg', 0.95);
    a.click();
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BACKGROUND PICKER â€” IndexedDB persistent storage
   Records: {id, name, dataUrl, isDefault}
   Backgrounds survive page refresh and tab close.
   â˜… button marks one as the default (auto-applied on load).
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

let bgDB = null;
let bgLibrary = [];   // in-memory cache [{id, name, dataUrl, isDefault}]
let bgActiveId = null;

function bgOpenDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('bgStore', 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('backgrounds', { keyPath: 'id' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function bgLoadAll() {
  return new Promise((resolve) => {
    const tx = bgDB.transaction('backgrounds', 'readonly');
    const req = tx.objectStore('backgrounds').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

function bgSave(record) {
  return new Promise((resolve) => {
    const tx = bgDB.transaction('backgrounds', 'readwrite');
    tx.objectStore('backgrounds').put(record);
    tx.oncomplete = resolve;
  });
}

function bgDeleteDB(id) {
  return new Promise((resolve) => {
    const tx = bgDB.transaction('backgrounds', 'readwrite');
    tx.objectStore('backgrounds').delete(id);
    tx.oncomplete = resolve;
  });
}

function bgClearDefault() {
  return new Promise((resolve) => {
    const tx = bgDB.transaction('backgrounds', 'readwrite');
    const store = tx.objectStore('backgrounds');
    const req = store.getAll();
    req.onsuccess = () => {
      const toUpdate = (req.result || []).filter(r => r.isDefault);
      if (toUpdate.length === 0) { resolve(); return; }
      toUpdate.forEach(r => store.put({ ...r, isDefault: false }));
      tx.oncomplete = resolve;
    };
  });
}

function bgApply(dataUrl) {
  const card = document.getElementById('card');
  const activeTheme = document.querySelector('.theme-btn.active').getAttribute('data-theme');
  const defaultGrad = activeTheme === 'light' 
    ? "linear-gradient(135deg, #FFFFFF 0%, #F4F8FC 100%)" 
    : "linear-gradient(135deg, #161922 0%, #0b0d12 100%)";
  card.style.backgroundImage = dataUrl ? 'url("' + dataUrl + '")' : defaultGrad;
  card.style.backgroundSize = '100% 100%';
  card.style.backgroundPosition = 'center';
  card.style.backgroundRepeat = 'no-repeat';
}

function bgRenderGrid() {
  const grid = document.getElementById('bgGrid');
  const empty = document.getElementById('bgEmpty');

  Array.from(grid.querySelectorAll('.bg-thumb-wrap')).forEach(el => el.remove());

  if (bgLibrary.length === 0) {
    empty.style.display = '';
    bgApply(null);
    return;
  }
  empty.style.display = 'none';

  bgLibrary.forEach(bg => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-thumb-wrap';

    const img = document.createElement('img');
    img.className = 'bg-thumb' + (bg.id === bgActiveId ? ' selected' : '');
    img.src = bg.dataUrl;
    img.title = bg.name;
    img.onclick = () => {
      bgActiveId = bg.id;
      bgApply(bg.dataUrl);
      bgRenderGrid();
    };

    // ★ Star = set as default (auto-applied on next load)
    const star = document.createElement('button');
    star.className = 'bg-thumb-star' + (bg.isDefault ? ' is-default' : '');
    star.title = bg.isDefault ? 'Default background' : 'Set as default';
    star.textContent = '★';
    star.onclick = async (e) => {
      e.stopPropagation();
      await bgClearDefault();
      bgLibrary = bgLibrary.map(b => ({ ...b, isDefault: false }));
      const target = bgLibrary.find(b => b.id === bg.id);
      if (target) {
        target.isDefault = true;
        await bgSave(target);
      }
      bgRenderGrid();
    };

    const del = document.createElement('button');
    del.className = 'bg-thumb-del';
    del.title = 'Remove';
    del.textContent = '×';
    del.onclick = async (e) => {
      e.stopPropagation();
      await bgDeleteDB(bg.id);
      bgLibrary = bgLibrary.filter(b => b.id !== bg.id);
      if (bgActiveId === bg.id) {
        const next = bgLibrary[0] || null;
        bgActiveId = next ? next.id : null;
        bgApply(next ? next.dataUrl : null);
      }
      bgRenderGrid();
    };

    wrap.appendChild(img);
    wrap.appendChild(star);
    wrap.appendChild(del);
    grid.appendChild(wrap);
  });

  const activeBg = bgLibrary.find(b => b.id === bgActiveId) || bgLibrary[0];
  if (activeBg) {
    bgActiveId = activeBg.id;
    bgApply(activeBg.dataUrl);
  }
}

async function bgHandleUpload(files) {
  let loaded = 0;
  const total = files.length;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const id = 'bg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const record = { id, name: file.name, dataUrl: e.target.result, isDefault: false };
      bgLibrary.push(record);
      await bgSave(record);
      bgActiveId = id;
      loaded++;
      if (loaded === total) bgRenderGrid();
    };
    reader.readAsDataURL(file);
  });
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INIT & EVENT LISTENERS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
window.addEventListener('DOMContentLoaded', function () {
  // Background picker init â€” load from IndexedDB (persists across refreshes)
  bgOpenDB().then(async (db) => {
    bgDB = db;
    bgLibrary = await bgLoadAll();
    const def = bgLibrary.find(b => b.isDefault);
    if (def) {
      bgActiveId = def.id;
      bgApply(def.dataUrl);
    }
    bgRenderGrid();
  }).catch(err => {
    console.warn("IndexedDB init failed (Incognito mode?). Backgrounds will not save.", err);
    bgRenderGrid();
  });
  document.getElementById('bgUploadInput').addEventListener('change', function () {
    if (this.files.length) bgHandleUpload(this.files);
    this.value = ''; // allow re-uploading same file
  });

  // Background Drag & Drop
  const dropZone = document.getElementById('bgDropZone');
  const dropLabel = document.getElementById('bgDropLabel');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropLabel.classList.add('drag-over'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropLabel.classList.remove('drag-over'), false);
  });

  dropZone.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    // Filter for images
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      bgHandleUpload(imageFiles);
    }
  }, false);

  // Text Colors Logic
  const primaryColor = document.getElementById('colorPrimary');
  const primaryHex = document.getElementById('hexPrimary');
  const secondaryColor = document.getElementById('colorSecondary');
  const secondaryHex = document.getElementById('hexSecondary');
  const tertiaryColor = document.getElementById('colorTertiary');
  const tertiaryHex = document.getElementById('hexTertiary');

  const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

  const updateColors = (source) => {
    if (source === primaryHex && isValidHex(primaryHex.value)) primaryColor.value = primaryHex.value;
    else if (source === primaryColor) primaryHex.value = primaryColor.value;
    
    if (source === secondaryHex && isValidHex(secondaryHex.value)) secondaryColor.value = secondaryHex.value;
    else if (source === secondaryColor) secondaryHex.value = secondaryColor.value;
    
    if (source === tertiaryHex && isValidHex(tertiaryHex.value)) tertiaryColor.value = tertiaryHex.value;
    else if (source === tertiaryColor) tertiaryHex.value = tertiaryColor.value;

    const card = document.getElementById('card');
    card.style.setProperty('--color-primary', primaryColor.value);
    card.style.setProperty('--color-secondary', secondaryColor.value);
    card.style.setProperty('--color-tertiary', tertiaryColor.value);
    
    // Save to localStorage
    localStorage.setItem('c3_primary', primaryColor.value);
    localStorage.setItem('c3_secondary', secondaryColor.value);
    localStorage.setItem('c3_tertiary', tertiaryColor.value);
  };

  [primaryColor, secondaryColor, tertiaryColor].forEach(input => {
    input.addEventListener('input', () => updateColors(input));
  });
  
  [primaryHex, secondaryHex, tertiaryHex].forEach(input => {
    input.addEventListener('input', () => updateColors(input));
    input.addEventListener('blur', () => {
      if (!input.value.startsWith('#')) input.value = '#' + input.value;
      if (isValidHex(input.value)) updateColors(input);
    });
  });

  // Global Formatting Toggles state
  const globalFormat = {
    primary:   { b: true, i: false, u: false },
    secondary: { b: false, i: false, u: false },
    tertiary:  { b: true, i: false, u: false }
  };

  const syncFormats = () => {
    const card = document.getElementById('card');
    for (const cat in globalFormat) {
      card.style.setProperty(`--fw-${cat}`, globalFormat[cat].b ? 'bold' : 'normal');
      card.style.setProperty(`--fs-${cat}`, globalFormat[cat].i ? 'italic' : 'normal');
      card.style.setProperty(`--td-${cat}`, globalFormat[cat].u ? 'underline' : 'none');
      
      // Update UI buttons
      document.querySelector(`.fmt-tog[data-cat="${cat}"][data-fmt="b"]`).classList.toggle('active', globalFormat[cat].b);
      document.querySelector(`.fmt-tog[data-cat="${cat}"][data-fmt="i"]`).classList.toggle('active', globalFormat[cat].i);
      document.querySelector(`.fmt-tog[data-cat="${cat}"][data-fmt="u"]`).classList.toggle('active', globalFormat[cat].u);
    }
    localStorage.setItem('globalFormat', JSON.stringify(globalFormat));
  };

  // Restore state from LocalStorage
  const savedFmt = localStorage.getItem('globalFormat');
  if (savedFmt) Object.assign(globalFormat, JSON.parse(savedFmt));
  
  document.querySelectorAll('.fmt-tog').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = btn.getAttribute('data-cat');
      const fmt = btn.getAttribute('data-fmt');
      globalFormat[cat][fmt] = !globalFormat[cat][fmt];
      syncFormats();
    });
  });
  syncFormats();

  // Load colors from localStorage
  if (localStorage.getItem('c3_primary')) {
    primaryColor.value = localStorage.getItem('c3_primary');
    primaryHex.value = primaryColor.value;
  }
  if (localStorage.getItem('c3_secondary')) {
    secondaryColor.value = localStorage.getItem('c3_secondary');
    secondaryHex.value = secondaryColor.value;
  }
  if (localStorage.getItem('c3_tertiary')) {
    tertiaryColor.value = localStorage.getItem('c3_tertiary');
    tertiaryHex.value = tertiaryColor.value;
  }
  updateColors();

  // Event listeners
  document.getElementById('cardWidth').addEventListener('input', function () {
    document.getElementById('cardWidthVal').textContent = this.value + 'px';
    generate();
  });
  document.getElementById('overallScale').addEventListener('input', function () {
    document.getElementById('overallScaleVal').textContent = this.value + '%';
    generate();
  });
  document.getElementById('headingScale').addEventListener('input', function () {
    document.getElementById('headingScaleVal').textContent = this.value + '%';
    generate();
  });
  document.getElementById('tableSpacing').addEventListener('input', function () {
    document.getElementById('tableSpacingVal').textContent = this.value + '%';
    generate();
  });
  
  document.getElementById('cardFormat').addEventListener('change', generate);

  document.getElementById('logoUpload').addEventListener('change', function(e) {
    const file = this.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (ev) => { 
        customLogoData = ev.target.result; 
        document.getElementById('removeLogo').style.display = 'inline-block';
        generate(); 
      };
      reader.readAsDataURL(file);
    }
  });
  document.getElementById('removeLogo').addEventListener('click', function(e) {
    customLogoData = null;
    this.style.display = 'none';
    document.getElementById('logoUpload').value = '';
    generate();
  });
  document.getElementById('logoPos').addEventListener('change', function(e) {
    customLogoPos = this.value;
    generate();
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      if (theme === 'light') {
        document.getElementById('hexPrimary').value = '#2D7DF3';
        document.getElementById('hexSecondary').value = '#161B1E';
        document.getElementById('hexTertiary').value = '#A7B5CA';
        const activeBg = bgLibrary.find(b => b.id === bgActiveId);
        bgApply(activeBg ? activeBg.dataUrl : null);
      } else {
        document.getElementById('hexPrimary').value = '#4aeabc';
        document.getElementById('hexSecondary').value = '#ffffff';
        document.getElementById('hexTertiary').value = '#d4c97a';
        const activeBg = bgLibrary.find(b => b.id === bgActiveId);
        bgApply(activeBg ? activeBg.dataUrl : null);
      }
      ['Primary','Secondary','Tertiary'].forEach(k => {
        document.getElementById('hex' + k).dispatchEvent(new Event('blur'));
      });
    });
  });

  document.getElementById('csvUpload').addEventListener('change', function(e) {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n');
      let out = "";
      let currentCat = "";
      lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 4) {
          const cat = parts[0].trim().toUpperCase();
          const stock = parts[1].trim();
          const profit = parts[2].trim();
          const dur = parts[3].trim();
          if (!cat || stock.toLowerCase() === 'stock name' || stock.toLowerCase() === 'stock') return;
          if (cat !== currentCat) {
            if (currentCat) out += "\n";
            out += cat + ":\n";
            currentCat = cat;
          }
          out += `${stock}: ${profit} in ${dur}\n`;
        }
      });
      if (out) { document.getElementById('inputText').value = out; generate(); }
    };
    reader.readAsText(file);
    this.value = '';
  });

  ['fontFamily','sebiReg'].forEach(id => {
    document.getElementById(id).addEventListener('change', generate);
  });
  document.getElementById('inputText').addEventListener('input', generate);
  document.getElementById('disclaimer').addEventListener('input', generate);

  // Tab switching logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.getAttribute('data-tab')).classList.add('active');
    });
  });

  ['btnBold', 'btnItalic', 'btnUnderline'].forEach(id => {
    document.getElementById(id).addEventListener('mousedown', function(e) {
      e.preventDefault(); 
      const cmd = id.replace('btn', '').toLowerCase();
      document.execCommand(cmd, false, null);
    });
  });

  document.getElementById('btnHighlight').addEventListener('mousedown', function(e) {
    e.preventDefault(); // Prevents selection from being lost when clicking the button
    const col = document.getElementById('highlightColor').value;
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, col);
  });

  // Init
  generate();
});
