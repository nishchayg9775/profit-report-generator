const COL_HEADERS = {
  EQUITY: ['STOCK NAME', 'RETURNS', 'DURATION'],
  FUTURES: ['STOCK NAME', 'RETURNS/LOT', 'DURATION'],
  OPTIONS: ['STOCK NAME', 'RETURNS/STRATEGY', 'DURATION'],
  COMMODITY: ['STOCK NAME', 'RETURNS', 'DURATION']
};

const SECTION_ORDER = { EQUITY: 0, OPTIONS: 1, FUTURES: 2, COMMODITY: 3 };
const THEME_DEFAULTS = {
  dark: { primary: '#4aeabc', secondary: '#ffffff', tertiary: '#d4c97a' },
  light: { primary: '#2d7df3', secondary: '#161b1e', tertiary: '#8ea0b6' }
};
const TITLE_PALETTES = {
  classic: {
    dark: { accent: '#4aeabc', main: '#f7fbff', accentShadow: '0 0 22px rgba(74,234,188,.18)', mainShadow: '0 10px 30px rgba(0,0,0,.16)' },
    light: { accent: '#185fff', main: '#172130', accentShadow: '0 10px 24px rgba(24,95,255,.14)', mainShadow: 'none' }
  },
  spotlight: {
    dark: { accent: '#70ecff', main: '#ffe7f3', accentShadow: '0 0 24px rgba(112,236,255,.18)', mainShadow: '0 12px 28px rgba(255,95,162,.12)' },
    light: { accent: '#ff5d96', main: '#18212f', accentShadow: '0 10px 24px rgba(255,93,150,.16)', mainShadow: 'none' }
  },
  stacked: {
    dark: { accent: '#67f2d8', main: '#f5f1ff', accentShadow: '0 0 24px rgba(103,242,216,.16)', mainShadow: '0 10px 28px rgba(123,77,255,.14)' },
    light: { accent: '#6a46ff', main: '#172233', accentShadow: '0 10px 22px rgba(106,70,255,.16)', mainShadow: 'none' }
  },
  tagged: {
    dark: { accent: '#84f5de', main: '#f7f4ff', accentShadow: '0 0 24px rgba(132,245,222,.16)', mainShadow: '0 10px 28px rgba(128,0,255,.14)' },
    light: { accent: '#6d4bff', main: '#151f31', accentShadow: '0 10px 24px rgba(109,75,255,.16)', mainShadow: 'none' }
  },
  ledger: {
    dark: { accent: '#f7ce46', main: '#eaf3ff', accentShadow: '0 0 20px rgba(247,206,70,.14)', mainShadow: '0 10px 24px rgba(0,0,0,.2)' },
    light: { accent: '#1270ff', main: '#152032', accentShadow: '0 10px 24px rgba(18,112,255,.12)', mainShadow: 'none' }
  },
  ribbon: {
    dark: { accent: '#ff69b7', main: '#fff0fa', accentShadow: '0 0 24px rgba(255,105,183,.16)', mainShadow: '0 10px 26px rgba(123,77,255,.12)' },
    light: { accent: '#ff5d96', main: '#231828', accentShadow: '0 10px 22px rgba(255,93,150,.15)', mainShadow: 'none' }
  },
  glass: {
    dark: { accent: '#83f4ff', main: '#f4fbff', accentShadow: '0 0 24px rgba(131,244,255,.16)', mainShadow: '0 10px 24px rgba(0,0,0,.14)' },
    light: { accent: '#0eb5d3', main: '#163042', accentShadow: '0 10px 22px rgba(14,181,211,.14)', mainShadow: 'none' }
  },
  editorial: {
    dark: { accent: '#ffbf4d', main: '#fff4de', accentShadow: '0 0 24px rgba(255,191,77,.14)', mainShadow: '0 10px 24px rgba(0,0,0,.14)' },
    light: { accent: '#d68000', main: '#1e1a16', accentShadow: '0 10px 20px rgba(214,128,0,.14)', mainShadow: 'none' }
  },
  pillars: {
    dark: { accent: '#ffb347', main: '#f4f6ff', accentShadow: '0 0 24px rgba(255,179,71,.16)', mainShadow: '0 10px 26px rgba(123,77,255,.12)' },
    light: { accent: '#7c4dff', main: '#1a1f2c', accentShadow: '0 10px 22px rgba(124,77,255,.14)', mainShadow: 'none' }
  },
  mono: {
    dark: { accent: '#9ef9ea', main: '#f1f5ff', accentShadow: '0 0 22px rgba(158,249,234,.16)', mainShadow: '0 10px 24px rgba(0,0,0,.16)' },
    light: { accent: '#0f79ff', main: '#101726', accentShadow: '0 10px 22px rgba(15,121,255,.12)', mainShadow: 'none' }
  }
};
const SECTION_ACCENTS = [
  { a: '#63e6ff', b: '#5b5bf6', soft: 'rgba(99,230,255,.22)', strong: 'rgba(91,91,246,.18)', border: 'rgba(99,230,255,.28)' },
  { a: '#ff5fa2', b: '#ffb347', soft: 'rgba(255,95,162,.22)', strong: 'rgba(255,179,71,.2)', border: 'rgba(255,166,84,.3)' },
  { a: '#7b4dff', b: '#2ef2d0', soft: 'rgba(123,77,255,.22)', strong: 'rgba(46,242,208,.18)', border: 'rgba(46,242,208,.3)' },
  { a: '#f7ce46', b: '#ff7a18', soft: 'rgba(247,206,70,.22)', strong: 'rgba(255,122,24,.18)', border: 'rgba(247,206,70,.32)' }
];

let generateTimeout;
let customLogoData = null;
let customLogoPos = 'top-left';
let bgDB = null;
let bgLibrary = [];
let bgActiveId = null;

function bgBuildBundledUrl(fileName) {
  const encodedPath = fileName.split('/').map(encodeURIComponent).join('/');
  return new URL(encodedPath, window.location.href).href;
}

const BUNDLED_BACKGROUNDS = [
  { id: 'bundled-1', name: '137497973_9c1d7588-1a4f-1.jpg', dataUrl: bgBuildBundledUrl('137497973_9c1d7588-1a4f-1.jpg'), isBundled: true },
  { id: 'bundled-2', name: '137497973_9c1d7588-1a4f-11ee-8564-42010a280815.jpg', dataUrl: bgBuildBundledUrl('137497973_9c1d7588-1a4f-11ee-8564-42010a280815.jpg'), isBundled: true },
  { id: 'bundled-3', name: 'dasa.jpg', dataUrl: bgBuildBundledUrl('dasa.jpg'), isBundled: true },
  { id: 'bundled-4', name: 'bg-4.jpeg', dataUrl: bgBuildBundledUrl('bg-4.jpeg'), isBundled: true }
];

function parseInput(text) {
  const sections = [];
  let currentSection = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^(Equity|Futures?|Options?|Commodity)\s*:?\s*$/i.test(line)) {
      let name = line.replace(/\s*:?\s*$/, '').toUpperCase();
      if (name === 'FUTURE') name = 'FUTURES';
      if (name === 'OPTION') name = 'OPTIONS';
      currentSection = { name, rows: [] };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) continue;

    const moreMatch = line.match(/^[+&]\s*(\d+)\s+more/i);
    if (moreMatch) {
      currentSection.more = `+${moreMatch[1]} more`;
      continue;
    }

    const rowMatch = line.match(/^(.+?):\s*(.+?)\s+(?:in\s+|on\s+)(.+)$/i);
    if (!rowMatch) continue;

    let returns = rowMatch[2].trim();
    let duration = rowMatch[3].trim();
    duration = duration.replace(/^(?:the\s+)?same day$/i, 'Same Day');
    duration = duration.replace(/^(?:just|only|the)\s+/i, '');
    duration = duration.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    if (/futures/i.test(currentSection.name)) {
      if (!/₹/.test(returns)) returns = returns.startsWith('-') ? `-₹${returns.slice(1).trim()}` : `₹${returns}`;
    } else if (!returns.includes('%')) {
      returns = `${returns}%`;
    }

    currentSection.rows.push({
      name: rowMatch[1].trim().toUpperCase(),
      returns,
      duration
    });
  }

  return sections.sort((a, b) => (SECTION_ORDER[a.name] ?? 99) - (SECTION_ORDER[b.name] ?? 99));
}

function getActiveTheme() {
  const active = document.querySelector('.theme-btn.active');
  return active ? active.getAttribute('data-theme') : 'dark';
}

function getSelectedTemplate() {
  const active = document.querySelector('.preset-btn.active');
  return active ? active.getAttribute('data-template') : 'classic';
}

function getSectionAccent(index) {
  return SECTION_ACCENTS[index % SECTION_ACCENTS.length];
}

function makeEditable(element) {
  element.contentEditable = 'true';
  element.spellcheck = false;
  return element;
}

function createEditableElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return makeEditable(element);
}

function createSectionMore(text, fontSize) {
  const more = createEditableElement('div', 'section-more', text);
  more.style.fontSize = `${fontSize}px`;
  return more;
}

function bgGetAll() {
  return [...BUNDLED_BACKGROUNDS, ...bgLibrary];
}

function bgOpenDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bgStore', 1);
    request.onupgradeneeded = event => event.target.result.createObjectStore('backgrounds', { keyPath: 'id' });
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function bgLoadAll() {
  return new Promise(resolve => {
    const transaction = bgDB.transaction('backgrounds', 'readonly');
    const request = transaction.objectStore('backgrounds').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

function bgSave(record) {
  return new Promise(resolve => {
    const transaction = bgDB.transaction('backgrounds', 'readwrite');
    transaction.objectStore('backgrounds').put(record);
    transaction.oncomplete = resolve;
  });
}

function bgDeleteDB(id) {
  return new Promise(resolve => {
    const transaction = bgDB.transaction('backgrounds', 'readwrite');
    transaction.objectStore('backgrounds').delete(id);
    transaction.oncomplete = resolve;
  });
}

function bgClearDefault() {
  return new Promise(resolve => {
    const transaction = bgDB.transaction('backgrounds', 'readwrite');
    const store = transaction.objectStore('backgrounds');
    const request = store.getAll();
    request.onsuccess = () => {
      (request.result || []).filter(item => item.isDefault).forEach(item => store.put({ ...item, isDefault: false }));
      transaction.oncomplete = resolve;
    };
    request.onerror = () => resolve();
  });
}

function getDefaultCardBackground(theme, template) {
  const gradients = {
    classic: {
      dark: 'linear-gradient(135deg, #161922 0%, #0b0d12 100%)',
      light: 'linear-gradient(135deg, #ffffff 0%, #eef4fb 100%)'
    },
    spotlight: {
      dark: 'radial-gradient(circle at 14% 14%, rgba(99,230,255,.22), transparent 24%), radial-gradient(circle at 86% 18%, rgba(255,95,162,.18), transparent 24%), linear-gradient(160deg, #121826 0%, #1d2436 50%, #0c1018 100%)',
      light: 'radial-gradient(circle at 14% 14%, rgba(99,230,255,.16), transparent 24%), radial-gradient(circle at 86% 18%, rgba(255,95,162,.14), transparent 24%), linear-gradient(160deg, #fffdf8 0%, #eef5ff 100%)'
    },
    stacked: {
      dark: 'radial-gradient(circle at 14% 14%, rgba(123,77,255,.28), transparent 28%), radial-gradient(circle at 84% 82%, rgba(74,234,188,.18), transparent 28%), linear-gradient(160deg, #0d1020 0%, #131b30 100%)',
      light: 'radial-gradient(circle at 14% 14%, rgba(123,77,255,.16), transparent 24%), radial-gradient(circle at 84% 82%, rgba(255,183,71,.14), transparent 28%), linear-gradient(160deg, #fffdf7 0%, #eef5ff 100%)'
    },
    tagged: {
      dark: 'radial-gradient(circle at 8% 92%, rgba(128,0,255,.35), transparent 22%), radial-gradient(circle at 88% 84%, rgba(46,242,208,.2), transparent 24%), linear-gradient(155deg, #131735 0%, #171c3a 52%, #11152b 100%)',
      light: 'radial-gradient(circle at 8% 92%, rgba(128,0,255,.14), transparent 22%), radial-gradient(circle at 88% 84%, rgba(46,242,208,.12), transparent 24%), linear-gradient(155deg, #fbfbff 0%, #eef4ff 52%, #f7fbff 100%)'
    },
    ribbon: {
      dark: 'radial-gradient(circle at 12% 18%, rgba(255,95,162,.2), transparent 24%), radial-gradient(circle at 86% 12%, rgba(123,77,255,.2), transparent 24%), linear-gradient(145deg, #17111f 0%, #241739 56%, #120f19 100%)',
      light: 'radial-gradient(circle at 12% 18%, rgba(255,95,162,.12), transparent 24%), radial-gradient(circle at 86% 12%, rgba(123,77,255,.12), transparent 24%), linear-gradient(145deg, #fff9f6 0%, #f7f3ff 100%)'
    },
    glass: {
      dark: 'radial-gradient(circle at 18% 12%, rgba(99,230,255,.18), transparent 28%), radial-gradient(circle at 82% 82%, rgba(74,234,188,.16), transparent 26%), linear-gradient(165deg, #0f1824 0%, #16263a 50%, #101924 100%)',
      light: 'radial-gradient(circle at 18% 12%, rgba(99,230,255,.1), transparent 28%), radial-gradient(circle at 82% 82%, rgba(74,234,188,.1), transparent 26%), linear-gradient(165deg, #fbfdff 0%, #eef7ff 52%, #f9fbff 100%)'
    },
    editorial: {
      dark: 'radial-gradient(circle at 18% 16%, rgba(255,179,71,.2), transparent 22%), linear-gradient(155deg, #0d1118 0%, #1c2331 52%, #10151d 100%)',
      light: 'radial-gradient(circle at 18% 16%, rgba(255,179,71,.12), transparent 22%), linear-gradient(155deg, #fffdf8 0%, #f4f4f0 52%, #eef5ff 100%)'
    },
    pillars: {
      dark: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,.08), transparent 26%), linear-gradient(180deg, #1a1530 0%, #12192b 100%)',
      light: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,.5), transparent 26%), linear-gradient(180deg, #fffaf5 0%, #eef2f8 100%)'
    },
    ledger: {
      dark: 'linear-gradient(180deg, #0b0d11 0%, #141821 100%)',
      light: 'linear-gradient(180deg, #ffffff 0%, #f2f6fb 100%)'
    },
    mono: {
      dark: 'linear-gradient(160deg, #10141c 0%, #1a202a 100%)',
      light: 'linear-gradient(160deg, #fcfcfd 0%, #eef3f8 100%)'
    }
  };

  return gradients[template]?.[theme] || gradients.classic.dark;
}

function bgApply(dataUrl) {
  const card = document.getElementById('card');
  card.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : getDefaultCardBackground(getActiveTheme(), getSelectedTemplate());
  card.style.backgroundSize = dataUrl ? 'cover' : '100% 100%';
  card.style.backgroundPosition = 'center';
  card.style.backgroundRepeat = 'no-repeat';
}

function bgRenderGrid() {
  const grid = document.getElementById('bgGrid');
  const empty = document.getElementById('bgEmpty');
  const backgrounds = bgGetAll();

  Array.from(grid.querySelectorAll('.bg-thumb-wrap')).forEach(node => node.remove());

  if (!backgrounds.length) {
    empty.style.display = '';
    bgApply(null);
    return;
  }

  empty.style.display = 'none';
  backgrounds.forEach(background => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-thumb-wrap';

    const img = document.createElement('img');
    img.className = `bg-thumb${background.id === bgActiveId ? ' selected' : ''}`;
    img.src = background.dataUrl;
    img.title = background.name;
    img.onclick = () => {
      bgActiveId = background.id;
      bgApply(background.dataUrl);
      bgRenderGrid();
    };

    const star = document.createElement('button');
    star.className = `bg-thumb-star${background.isDefault ? ' is-default' : ''}${background.isBundled ? ' is-hidden' : ''}`;
    star.type = 'button';
    star.title = background.isDefault ? 'Default background' : 'Set as default';
    star.textContent = '★';
    star.onclick = async event => {
      if (background.isBundled) return;
      event.stopPropagation();
      await bgClearDefault();
      bgLibrary = bgLibrary.map(item => ({ ...item, isDefault: false }));
      const target = bgLibrary.find(item => item.id === background.id);
      if (target) {
        target.isDefault = true;
        await bgSave(target);
      }
      bgRenderGrid();
    };

    const del = document.createElement('button');
    del.className = `bg-thumb-del${background.isBundled ? ' is-hidden' : ''}`;
    del.type = 'button';
    del.title = 'Remove';
    del.textContent = '×';
    del.onclick = async event => {
      if (background.isBundled) return;
      event.stopPropagation();
      await bgDeleteDB(background.id);
      bgLibrary = bgLibrary.filter(item => item.id !== background.id);
      if (bgActiveId === background.id) {
        bgActiveId = null;
        bgApply(null);
      }
      bgRenderGrid();
    };

    wrap.append(img, star, del);
    if (background.isBundled) {
      const badge = document.createElement('span');
      badge.className = 'bg-thumb-badge';
      badge.textContent = 'Local';
      wrap.appendChild(badge);
    }
    grid.appendChild(wrap);
  });

  const activeBg = backgrounds.find(item => item.id === bgActiveId) || bgLibrary[0];
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
    reader.onload = async event => {
      const id = `bg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const record = { id, name: file.name, dataUrl: event.target.result, isDefault: false };
      bgLibrary.push(record);
      await bgSave(record);
      bgActiveId = id;
      loaded += 1;
      if (loaded === total) bgRenderGrid();
    };
    reader.readAsDataURL(file);
  });
}

function getTemplateBase(template, headingScale) {
  if (template === 'spotlight') {
    return { padTB: .033, padLR: .055, sebiFz: .018, sebiMb: .009, titleFz: .074 * headingScale, titleMb: .022 * headingScale, secFz: .018, secMt: .03, secMb: .012, thFz: .017, thPad: .014, tdFz: .02, tdPad: .013, discFz: .013, discMt: .03, shellPad: .024, metaFz: .012 };
  }
  if (template === 'stacked') {
    return { padTB: .033, padLR: .046, sebiFz: .017, sebiMb: .009, titleFz: .07 * headingScale, titleMb: .022 * headingScale, secFz: .015, secMt: .018, secMb: .009, thFz: .012, thPad: .01, tdFz: .019, tdPad: .009, discFz: .012, discMt: .02, shellPad: .018, metaFz: .01 };
  }
  if (template === 'tagged') {
    return { padTB: .033, padLR: .05, sebiFz: .017, sebiMb: .009, titleFz: .07 * headingScale, titleMb: .022 * headingScale, secFz: .015, secMt: .02, secMb: .01, thFz: .0115, thPad: .009, tdFz: .0185, tdPad: .0095, discFz: .0115, discMt: .02, shellPad: .019, metaFz: .01 };
  }
  if (template === 'ribbon') {
    return { padTB: .036, padLR: .047, sebiFz: .017, sebiMb: .01, titleFz: .07 * headingScale, titleMb: .025 * headingScale, secFz: .015, secMt: .017, secMb: .01, thFz: .0115, thPad: .009, tdFz: .0185, tdPad: .01, discFz: .0115, discMt: .021, shellPad: .019, metaFz: .0105 };
  }
  if (template === 'glass') {
    return { padTB: .04, padLR: .05, sebiFz: .0175, sebiMb: .011, titleFz: .071 * headingScale, titleMb: .029 * headingScale, secFz: .0155, secMt: .02, secMb: .01, thFz: .011, thPad: .01, tdFz: .018, tdPad: .01, discFz: .012, discMt: .022, shellPad: .02, metaFz: .0105 };
  }
  if (template === 'editorial') {
    return { padTB: .038, padLR: .048, sebiFz: .0175, sebiMb: .011, titleFz: .072 * headingScale, titleMb: .027 * headingScale, secFz: .016, secMt: .018, secMb: .01, thFz: .011, thPad: .01, tdFz: .0185, tdPad: .01, discFz: .0118, discMt: .02, shellPad: .02, metaFz: .011 };
  }
  if (template === 'pillars') {
    return { padTB: .036, padLR: .046, sebiFz: .017, sebiMb: .01, titleFz: .068 * headingScale, titleMb: .024 * headingScale, secFz: .0155, secMt: .018, secMb: .01, thFz: .0112, thPad: .01, tdFz: .018, tdPad: .01, discFz: .0115, discMt: .021, shellPad: .019, metaFz: .0105 };
  }
  if (template === 'ledger') {
    return { padTB: .033, padLR: .044, sebiFz: .0165, sebiMb: .009, titleFz: .066 * headingScale, titleMb: .022 * headingScale, secFz: .0145, secMt: .014, secMb: .008, thFz: .012, thPad: .009, tdFz: .017, tdPad: .0085, discFz: .011, discMt: .018, shellPad: .016, metaFz: .01 };
  }
  if (template === 'mono') {
    return { padTB: .037, padLR: .048, sebiFz: .017, sebiMb: .01, titleFz: .069 * headingScale, titleMb: .025 * headingScale, secFz: .0155, secMt: .017, secMb: .009, thFz: .0112, thPad: .009, tdFz: .018, tdPad: .0095, discFz: .0115, discMt: .02, shellPad: .018, metaFz: .0105 };
  }
  return { padTB: .033, padLR: .05, sebiFz: .019, sebiMb: .009, titleFz: .08 * headingScale, titleMb: .022 * headingScale, secFz: .021, secMt: .025, secMb: .01, thFz: .019, thPad: .014, tdFz: .022, tdPad: .012, discFz: .013, discMt: .028, shellPad: .022, metaFz: .012 };
}

function getStackedColumnCount(width, sectionCount) {
  if (sectionCount <= 1) return 1;
  if (sectionCount === 2) return width >= 760 ? 2 : 1;
  if (sectionCount >= 3) return width >= 980 ? 3 : 1;
  return 1;
}

function getPresetGridColumns(template, width, sectionCount) {
  if (sectionCount <= 1) return 1;
  if (template === 'stacked') return getStackedColumnCount(width, sectionCount);
  if (template === 'tagged') return width >= 820 ? 2 : 1;
  if (template === 'ribbon') return width >= 760 ? 2 : 1;
  if (template === 'glass') return width >= 930 ? Math.min(3, sectionCount) : width >= 690 ? 2 : 1;
  if (template === 'pillars') return width >= 920 ? Math.min(3, sectionCount) : width >= 700 ? 2 : 1;
  if (template === 'mono') return width >= 820 ? 2 : 1;
  return 1;
}

function estimateGridHeight(itemHeights, columns, gap) {
  let total = 0;
  for (let index = 0; index < itemHeights.length; index += columns) {
    total += Math.max(...itemHeights.slice(index, index + columns)) + gap;
  }
  return total;
}

function estimateNaturalHeight(template, sections, width, headingScale, tableSpacing = 1) {
  const base = getTemplateBase(template, headingScale);
  const px = fraction => fraction * width;
  const totalRows = sections.reduce((sum, section) => sum + section.rows.length + (section.more ? parseInt(section.more, 10) : 0), 0);
  const sectionGap = px(base.secMt) * tableSpacing;

  if (template === 'spotlight') {
    const sectionHeight = sections.reduce((sum, section) => sum + px(base.shellPad) * 2 + px(base.secFz) + px(base.thFz) + px(base.thPad) * 2 + section.rows.length * (px(base.tdFz) + px(base.tdPad) * 2) + (section.more ? px(base.tdFz) * 1.2 : sectionGap * .4) + sectionGap, 0);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.08 + px(base.titleMb) + sectionHeight + px(base.discFz) * 3.1 + px(base.discMt);
  }

  if (template === 'stacked') {
    const columns = getStackedColumnCount(width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2 + px(base.secFz) + px(base.thFz) * 1.8 + section.rows.length * (px(base.tdFz) * 1.12 + px(base.tdPad) * 2) + (section.more ? px(base.tdFz) * 1.1 : px(base.secMt) * .35));
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.05 + px(base.titleMb) + gridHeight + px(base.discFz) * 3.1 + px(base.discMt);
  }

  if (template === 'tagged') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => {
      const listCount = Math.max(0, Math.min(4, section.rows.length - 1));
      return px(base.shellPad) * 1.95 + px(base.secFz) * 1.1 + px(base.titleFz) * .52 + listCount * (px(base.tdFz) * .96 + px(base.tdPad) * 1.28) + px(base.tdFz) * 1.1 + (section.more ? px(base.tdFz) * .72 : px(base.secMt) * .18);
    });
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap * .7) + (columns > 1 ? sectionGap * .3 : 0);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.04 + px(base.titleMb) + gridHeight + px(base.discFz) * 2.9 + px(base.discMt);
  }

  if (template === 'ribbon') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2.2 + px(base.secFz) + section.rows.length * (px(base.tdFz) * 1.48 + px(base.tdPad) * 2.2) + (section.more ? px(base.tdFz) * 1.1 : px(base.secMt) * .4));
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.05 + px(base.titleMb) + gridHeight + px(base.discFz) * 3 + px(base.discMt);
  }

  if (template === 'glass') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2.3 + px(base.secFz) * 1.15 + px(base.thFz) * 1.35 + section.rows.length * (px(base.tdFz) * 1.36 + px(base.tdPad) * 2.05) + (section.more ? px(base.tdFz) * 1.08 : px(base.secMt) * .35));
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.05 + px(base.titleMb) + gridHeight + px(base.discFz) * 3 + px(base.discMt);
  }

  if (template === 'editorial') {
    const lead = sections[0];
    const rest = sections.slice(1);
    const heroHeight = lead
      ? px(base.shellPad) * 2.4 + px(base.secFz) * 1.55 + lead.rows.length * (px(base.tdFz) * 1.25 + px(base.tdPad) * 1.75) + (lead.more ? px(base.tdFz) : px(base.secMt) * .3)
      : 0;
    const supportColumns = width >= 820 ? 2 : 1;
    const supportHeights = rest.map(section => px(base.shellPad) * 2 + px(base.secFz) + section.rows.length * (px(base.tdFz) * 1.2 + px(base.tdPad) * 1.85) + (section.more ? px(base.tdFz) : px(base.secMt) * .28));
    const supportHeight = rest.length ? estimateGridHeight(supportHeights, supportColumns, sectionGap) : 0;
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.05 + px(base.titleMb) + heroHeight + supportHeight + px(base.discFz) * 3 + px(base.discMt);
  }

  if (template === 'pillars') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2.4 + px(base.secFz) * 1.45 + section.rows.length * (px(base.tdFz) * 1.34 + px(base.tdPad) * 1.8) + (section.more ? px(base.tdFz) * 1.05 : px(base.secMt) * .32));
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.03 + px(base.titleMb) + gridHeight + px(base.discFz) * 3 + px(base.discMt);
  }

  if (template === 'ledger') {
    const sectionHeight = sections.reduce((sum, section) => sum + px(base.shellPad) * 1.7 + px(base.secFz) + px(base.thFz) + px(base.thPad) * 1.6 + section.rows.length * (px(base.tdFz) * 1.02 + px(base.tdPad) * 1.7) + (section.more ? px(base.tdFz) * .95 : sectionGap * .24) + sectionGap * .65, 0);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.02 + px(base.titleMb) + sectionHeight + px(base.discFz) * 2.8 + px(base.discMt);
  }

  if (template === 'mono') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2 + px(base.secFz) + section.rows.length * (px(base.tdFz) * 1.2 + px(base.tdPad) * 1.9) + (section.more ? px(base.tdFz) : px(base.secMt) * .32));
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.03 + px(base.titleMb) + gridHeight + px(base.discFz) * 2.9 + px(base.discMt);
  }

  return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.1 + px(base.titleMb) + sections.length * (px(base.secFz) + sectionGap + px(base.secMb) + px(base.thFz) + px(base.thPad) * 2) + totalRows * (px(base.tdFz) + px(base.tdPad) * 2) + px(base.discFz) * 3 + px(base.discMt);
}

function buildSizeMap(base, width, scale) {
  const sizes = {};
  for (const key in base) sizes[key] = Math.max(1, Math.round(base[key] * width * scale));
  return sizes;
}

function buildDataTable(headers, rows, sizes, horizontalPad, options = {}) {
  const table = document.createElement('table');
  table.className = options.tableClass || 'card-table';

  const colgroup = document.createElement('colgroup');
  ['c-name', 'c-ret', 'c-dur'].forEach(className => {
    const col = document.createElement('col');
    col.className = className;
    colgroup.appendChild(col);
  });
  table.appendChild(colgroup);

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headers.forEach((header, index) => {
    const th = createEditableElement('th', '', header);
    th.style.fontSize = `${sizes.thFz}px`;
    th.style.padding = `${sizes.thPad}px ${horizontalPad}px`;
    if (options.emphasisColumn === index) {
      th.classList.add('cell-emphasis');
      if (options.emphasisHeadBackground) th.style.background = options.emphasisHeadBackground;
      if (options.emphasisBorder) th.style.boxShadow = `inset 0 0 0 1px ${options.emphasisBorder}`;
    }
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    [row.name, row.returns, row.duration].forEach((value, index) => {
      const classes = ['td-name', 'td-returns', 'td-duration'];
      const td = createEditableElement('td', classes[index], value);
      td.style.fontSize = `${sizes.tdFz}px`;
      td.style.padding = `${sizes.tdPad}px ${horizontalPad}px`;
      if (options.emphasisColumn === index) {
        td.classList.add('cell-emphasis');
        if (options.emphasisCellBackground) td.style.background = options.emphasisCellBackground;
        if (options.emphasisBorder) td.style.boxShadow = `inset 0 0 0 1px ${options.emphasisBorder}`;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

function renderClassicSections(fragment, sections, sizes, tableSpacing, horizontalPad) {
  sections.forEach(section => {
    const label = createEditableElement('div', 'card-section', section.name);
    label.style.fontSize = `${sizes.secFz}px`;
    label.style.marginTop = `${Math.round(sizes.secMt * tableSpacing)}px`;
    label.style.marginBottom = `${sizes.secMb}px`;
    fragment.appendChild(label);

    const headers = COL_HEADERS[section.name] || COL_HEADERS.EQUITY;
    const table = buildDataTable(headers, section.rows, sizes, horizontalPad);
    table.style.marginBottom = section.more ? '0px' : `${Math.round(sizes.secMt * (tableSpacing - 1))}px`;
    fragment.appendChild(table);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .78));
      more.style.marginTop = `${Math.round(sizes.tdPad * .8)}px`;
      more.style.marginBottom = `${Math.round(sizes.secMt * tableSpacing)}px`;
      fragment.appendChild(more);
    }
  });
}

function renderSpotlightSections(fragment, sections, sizes, tableSpacing, horizontalPad) {
  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'spotlight-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.marginTop = `${Math.round(sizes.secMt * tableSpacing)}px`;
    shell.style.padding = `${sizes.shellPad}px`;

    const top = document.createElement('div');
    top.className = 'spotlight-top';
    const badge = createEditableElement('div', 'spotlight-badge', section.name);
    badge.style.fontSize = `${sizes.secFz}px`;
    top.appendChild(badge);

    const wrap = document.createElement('div');
    wrap.className = 'spotlight-table-wrap';
    wrap.style.marginTop = `${Math.round(sizes.secMb + sizes.tdPad)}px`;
    wrap.appendChild(buildDataTable(COL_HEADERS[section.name] || COL_HEADERS.EQUITY, section.rows, sizes, horizontalPad, {
      tableClass: 'card-table spotlight-table',
      emphasisColumn: 1,
      emphasisHeadBackground: `linear-gradient(180deg, ${accent.soft}, rgba(255,255,255,.02))`,
      emphasisCellBackground: `linear-gradient(180deg, ${accent.strong}, rgba(255,255,255,.01))`,
      emphasisBorder: accent.border
    }));

    shell.append(top, wrap);
    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .76));
      more.style.marginTop = `${Math.round(sizes.tdPad * 1.1)}px`;
      shell.appendChild(more);
    }
    fragment.appendChild(shell);
  });
}

function renderStackedSections(fragment, sections, sizes, width, tableSpacing) {
  const columns = getStackedColumnCount(width, sections.length);
  const grid = document.createElement('div');
  grid.className = 'stacked-layout';
  grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  grid.style.gap = `${Math.max(6, Math.round(sizes.secMt * tableSpacing))}px`;
  grid.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'stacked-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const top = document.createElement('div');
    top.className = 'stacked-top';
    const badge = createEditableElement('div', 'stacked-badge', section.name);
    badge.style.fontSize = `${sizes.secFz}px`;
    top.appendChild(badge);
    shell.appendChild(top);

    const columns = document.createElement('div');
    columns.className = 'stacked-columns';
    columns.style.fontSize = `${Math.round(sizes.thFz * .8)}px`;
    columns.innerHTML = '<span>#</span><span>Stock</span><span>Time</span><span class="stacked-col-return">Return</span>';
    shell.appendChild(columns);

    section.rows.forEach((row, rowIndex) => {
      const item = document.createElement('div');
      item.className = 'stacked-row';

      const indexBadge = document.createElement('div');
      indexBadge.className = 'stacked-index';
      indexBadge.textContent = String(rowIndex + 1).padStart(2, '0');
      indexBadge.style.fontSize = `${Math.round(sizes.thFz * .82)}px`;

      const main = document.createElement('div');
      main.className = 'stacked-main';
      const stockName = createEditableElement('div', 'stacked-name', row.name);
      stockName.style.fontSize = `${sizes.tdFz}px`;
      main.appendChild(stockName);

      const time = createEditableElement('div', 'stacked-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .74)}px`;
      const returns = createEditableElement('div', 'stacked-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .92)}px`;

      item.append(indexBadge, main, time, returns);
      shell.appendChild(item);
    });

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .76));
      more.classList.add('stacked-more');
      shell.appendChild(more);
    }

    grid.appendChild(shell);
  });

  fragment.appendChild(grid);
}

function renderTaggedSections(fragment, sections, sizes, width, tableSpacing) {
  const columns = getPresetGridColumns('tagged', width, sections.length);
  const layout = document.createElement('div');
  layout.className = 'tagged-layout';
  layout.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  layout.style.gap = `${Math.max(6, Math.round(sizes.secMt * tableSpacing * .8))}px`;
  layout.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'tagged-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const side = document.createElement('div');
    side.className = 'tagged-side';
    side.textContent = section.name;
    side.style.fontSize = `${Math.round(sizes.secFz * .95)}px`;

    const lead = section.rows[0] || { name: 'SECTION READY', returns: '--', duration: 'Add data' };
    const leadWrap = document.createElement('div');
    leadWrap.className = 'tagged-lead';

    const leadReturn = createEditableElement('div', 'tagged-lead-return', lead.returns);
    leadReturn.style.fontSize = `${Math.round(sizes.titleFz * .56)}px`;

    const leadName = createEditableElement('div', 'tagged-lead-name', lead.name);
    leadName.style.fontSize = `${Math.round(sizes.tdFz * 1.18)}px`;

    const leadTime = createEditableElement('div', 'tagged-lead-time', lead.duration);
    leadTime.style.fontSize = `${Math.round(sizes.tdFz * .78)}px`;

    leadWrap.append(leadReturn, leadName, leadTime);

    const list = document.createElement('div');
    list.className = 'tagged-list';
    const supportingRows = section.rows.slice(1, 5);

    supportingRows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'tagged-item';

      const name = createEditableElement('div', 'tagged-item-name', row.name);
      name.style.fontSize = `${Math.round(sizes.tdFz * 1.02)}px`;

      const time = createEditableElement('div', 'tagged-item-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .78)}px`;

      const returns = createEditableElement('div', 'tagged-item-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .82)}px`;

      item.append(name, time, returns);
      list.appendChild(item);
    });

    shell.append(side, leadWrap);
    if (supportingRows.length) shell.appendChild(list);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .72));
      more.classList.add('tagged-more');
      shell.appendChild(more);
    }

    layout.appendChild(shell);
  });

  fragment.appendChild(layout);
}

function renderRibbonSections(fragment, sections, sizes, width) {
  const columns = getPresetGridColumns('ribbon', width, sections.length);
  const layout = document.createElement('div');
  layout.className = 'ribbon-layout';
  layout.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  layout.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'ribbon-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const band = document.createElement('div');
    band.className = 'ribbon-band';
    const title = createEditableElement('div', 'ribbon-title', section.name);
    title.style.fontSize = `${sizes.secFz}px`;
    band.appendChild(title);
    shell.appendChild(band);

    const list = document.createElement('div');
    list.className = 'ribbon-list';
    section.rows.forEach((row, rowIndex) => {
      const item = document.createElement('div');
      item.className = 'ribbon-row';

      const head = document.createElement('div');
      head.className = 'ribbon-row-head';

      const indexBadge = document.createElement('div');
      indexBadge.className = 'ribbon-index';
      indexBadge.textContent = String(rowIndex + 1).padStart(2, '0');
      indexBadge.style.fontSize = `${Math.round(sizes.thFz * .82)}px`;

      const name = createEditableElement('div', 'ribbon-name', row.name);
      name.style.fontSize = `${sizes.tdFz}px`;

      const returns = createEditableElement('div', 'ribbon-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .9)}px`;

      head.append(indexBadge, name, returns);

      const metaRow = document.createElement('div');
      metaRow.className = 'ribbon-row-meta';
      const time = createEditableElement('div', 'ribbon-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .72)}px`;
      metaRow.appendChild(time);

      item.append(head, metaRow);
      list.appendChild(item);
    });

    shell.appendChild(list);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .76));
      more.classList.add('ribbon-more');
      shell.appendChild(more);
    }

    layout.appendChild(shell);
  });

  fragment.appendChild(layout);
}

function renderGlassSections(fragment, sections, sizes, width) {
  const columns = getPresetGridColumns('glass', width, sections.length);
  const layout = document.createElement('div');
  layout.className = 'glass-layout';
  layout.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  layout.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'glass-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const top = document.createElement('div');
    top.className = 'glass-top';
    const title = createEditableElement('div', 'glass-title', section.name);
    title.style.fontSize = `${Math.round(sizes.secFz * 1.02)}px`;
    top.appendChild(title);

    const head = document.createElement('div');
    head.className = 'glass-head';
    head.style.fontSize = `${Math.round(sizes.thFz * .82)}px`;
    head.innerHTML = '<span>Stock</span><span>Return</span><span>Time</span>';

    const body = document.createElement('div');
    body.className = 'glass-body';

    section.rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'glass-row';

      const name = createEditableElement('div', 'glass-name', row.name);
      name.style.fontSize = `${sizes.tdFz}px`;

      const returns = createEditableElement('div', 'glass-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .9)}px`;

      const time = createEditableElement('div', 'glass-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .72)}px`;

      item.append(name, returns, time);
      body.appendChild(item);
    });

    shell.append(top, head, body);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .74));
      more.classList.add('glass-more');
      shell.appendChild(more);
    }

    layout.appendChild(shell);
  });

  fragment.appendChild(layout);
}

function renderEditorialSections(fragment, sections, sizes, width) {
  if (!sections.length) return;

  const [leadSection, ...supportSections] = sections;
  const layout = document.createElement('div');
  layout.className = 'editorial-layout';

  const leadAccent = getSectionAccent(0);
  const hero = document.createElement('section');
  hero.className = 'editorial-hero';
  hero.style.setProperty('--accent-a', leadAccent.a);
  hero.style.setProperty('--accent-b', leadAccent.b);
  hero.style.setProperty('--accent-soft', leadAccent.soft);

  const heroTop = document.createElement('div');
  heroTop.className = 'editorial-hero-top';
  const heroBadge = createEditableElement('div', 'editorial-badge', leadSection.name);
  heroBadge.style.fontSize = `${sizes.secFz}px`;
  heroTop.appendChild(heroBadge);

  const heroGrid = document.createElement('div');
  heroGrid.className = 'editorial-hero-grid';

  const heroCopy = document.createElement('div');
  heroCopy.className = 'editorial-copy';
  const heroKicker = createEditableElement('div', 'editorial-kicker', 'Lead Segment');
  heroKicker.style.fontSize = `${Math.round(sizes.thFz * .9)}px`;
  const heroCaption = createEditableElement('div', 'editorial-caption', 'Highlighted trades in focus');
  heroCaption.style.fontSize = `${Math.round(sizes.tdFz * .9)}px`;
  heroCopy.append(heroKicker, heroCaption);

  const heroList = document.createElement('div');
  heroList.className = 'editorial-list';
  leadSection.rows.forEach(row => {
    const item = document.createElement('div');
    item.className = 'editorial-hero-row';

    const main = document.createElement('div');
    main.className = 'editorial-hero-main';
    const name = createEditableElement('div', 'editorial-hero-name', row.name);
    name.style.fontSize = `${sizes.tdFz}px`;
    const time = createEditableElement('div', 'editorial-hero-time', row.duration);
    time.style.fontSize = `${Math.round(sizes.tdFz * .72)}px`;
    main.append(name, time);

    const returns = createEditableElement('div', 'editorial-hero-return', row.returns);
    returns.style.fontSize = `${Math.round(sizes.tdFz * .9)}px`;

    item.append(main, returns);
    heroList.appendChild(item);
  });

  heroGrid.append(heroCopy, heroList);
  hero.append(heroTop, heroGrid);

  if (leadSection.more) {
    const more = createSectionMore(leadSection.more, Math.round(sizes.tdFz * .76));
    more.classList.add('editorial-more');
    hero.appendChild(more);
  }

  layout.appendChild(hero);

  if (supportSections.length) {
    const supportGrid = document.createElement('div');
    supportGrid.className = 'editorial-grid';
    supportGrid.style.gridTemplateColumns = `repeat(${width >= 820 ? 2 : 1}, minmax(0, 1fr))`;

    supportSections.forEach((section, index) => {
      const accent = getSectionAccent(index + 1);
      const shell = document.createElement('section');
      shell.className = 'editorial-shell';
      shell.style.setProperty('--accent-a', accent.a);
      shell.style.setProperty('--accent-b', accent.b);
      shell.style.setProperty('--accent-soft', accent.soft);

      const top = document.createElement('div');
      top.className = 'editorial-shell-top';
      const title = createEditableElement('div', 'editorial-shell-title', section.name);
      title.style.fontSize = `${sizes.secFz}px`;
      top.appendChild(title);
      shell.appendChild(top);

      section.rows.forEach(row => {
        const item = document.createElement('div');
        item.className = 'editorial-row';

        const main = document.createElement('div');
        main.className = 'editorial-row-main';
        const name = createEditableElement('div', 'editorial-row-name', row.name);
        name.style.fontSize = `${sizes.tdFz}px`;
        const time = createEditableElement('div', 'editorial-row-time', row.duration);
        time.style.fontSize = `${Math.round(sizes.tdFz * .7)}px`;
        main.append(name, time);

        const returns = createEditableElement('div', 'editorial-row-return', row.returns);
        returns.style.fontSize = `${Math.round(sizes.tdFz * .84)}px`;

        item.append(main, returns);
        shell.appendChild(item);
      });

      if (section.more) {
        const more = createSectionMore(section.more, Math.round(sizes.tdFz * .74));
        more.classList.add('editorial-more');
        shell.appendChild(more);
      }

      supportGrid.appendChild(shell);
    });

    layout.appendChild(supportGrid);
  }

  fragment.appendChild(layout);
}

function renderPillarSections(fragment, sections, sizes, width) {
  const columns = getPresetGridColumns('pillars', width, sections.length);
  const layout = document.createElement('div');
  layout.className = 'pillars-layout';
  layout.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  layout.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'pillar-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const cap = document.createElement('div');
    cap.className = 'pillar-cap';
    const title = createEditableElement('div', 'pillar-title', section.name);
    title.style.fontSize = `${sizes.secFz}px`;
    cap.appendChild(title);

    const caption = createEditableElement('div', 'pillar-caption', 'Trade highlights');
    caption.style.fontSize = `${Math.round(sizes.tdFz * .76)}px`;

    const list = document.createElement('div');
    list.className = 'pillar-list';
    section.rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'pillar-row';

      const dot = document.createElement('span');
      dot.className = 'pillar-dot';

      const main = document.createElement('div');
      main.className = 'pillar-row-main';
      const name = createEditableElement('div', 'pillar-row-name', row.name);
      name.style.fontSize = `${sizes.tdFz}px`;
      const time = createEditableElement('div', 'pillar-row-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .7)}px`;
      main.append(name, time);

      const returns = createEditableElement('div', 'pillar-row-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .86)}px`;

      item.append(dot, main, returns);
      list.appendChild(item);
    });

    shell.append(cap, caption, list);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .74));
      more.classList.add('pillar-more');
      shell.appendChild(more);
    }

    layout.appendChild(shell);
  });

  fragment.appendChild(layout);
}

function renderLedgerSections(fragment, sections, sizes, tableSpacing, horizontalPad) {
  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'ledger-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.marginTop = `${Math.round(sizes.secMt * tableSpacing)}px`;
    shell.style.padding = `${sizes.shellPad}px`;

    const top = document.createElement('div');
    top.className = 'ledger-top';
    const badge = createEditableElement('div', 'ledger-badge', section.name);
    badge.style.fontSize = `${sizes.secFz}px`;
    top.appendChild(badge);

    const table = buildDataTable(COL_HEADERS[section.name] || COL_HEADERS.EQUITY, section.rows, sizes, horizontalPad, {
      tableClass: 'card-table ledger-table',
      emphasisColumn: 1,
      emphasisHeadBackground: `linear-gradient(180deg, ${accent.soft}, rgba(255,255,255,.02))`,
      emphasisCellBackground: `linear-gradient(90deg, rgba(255,255,255,.02), ${accent.strong})`,
      emphasisBorder: accent.border
    });

    shell.append(top, table);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .72));
      more.classList.add('ledger-more');
      shell.appendChild(more);
    }

    fragment.appendChild(shell);
  });
}

function renderMonoSections(fragment, sections, sizes, width) {
  const columns = getPresetGridColumns('mono', width, sections.length);
  const layout = document.createElement('div');
  layout.className = 'mono-layout';
  layout.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  layout.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'mono-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const top = document.createElement('div');
    top.className = 'mono-top';
    const title = createEditableElement('div', 'mono-title', section.name);
    title.style.fontSize = `${sizes.secFz}px`;
    top.appendChild(title);
    shell.appendChild(top);

    section.rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'mono-row';

      const main = document.createElement('div');
      main.className = 'mono-row-main';
      const name = createEditableElement('div', 'mono-name', row.name);
      name.style.fontSize = `${sizes.tdFz}px`;
      const time = createEditableElement('div', 'mono-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .72)}px`;
      main.append(name, time);

      const returns = createEditableElement('div', 'mono-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .86)}px`;

      item.append(main, returns);
      shell.appendChild(item);
    });

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .74));
      more.classList.add('mono-more');
      shell.appendChild(more);
    }

    layout.appendChild(shell);
  });

  fragment.appendChild(layout);
}

function setCardSurfaceVars(card, theme) {
  const isLight = theme === 'light';
  card.style.setProperty('--surface-border', isLight ? 'rgba(22,27,30,.12)' : 'rgba(255,255,255,.15)');
  card.style.setProperty('--surface-border-strong', isLight ? 'rgba(22,27,30,.18)' : 'rgba(255,255,255,.32)');
  card.style.setProperty('--surface-fill', isLight ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.04)');
  card.style.setProperty('--surface-fill-strong', isLight ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.08)');
  card.style.setProperty('--row-alt', isLight ? 'rgba(45,125,243,.05)' : 'rgba(255,255,255,.03)');
  card.style.setProperty('--muted-text', isLight ? 'rgba(22,27,30,.68)' : 'rgba(255,255,255,.74)');
  card.style.setProperty('--shadow-elevated', isLight ? '0 22px 50px rgba(45,125,243,.14)' : '0 24px 54px rgba(0,0,0,.38)');
}

function setTitlePaletteVars(card, theme, template) {
  const palette = TITLE_PALETTES[template]?.[theme] || TITLE_PALETTES.classic[theme] || TITLE_PALETTES.classic.dark;
  card.style.setProperty('--title-accent', palette.accent);
  card.style.setProperty('--title-main', palette.main);
  card.style.setProperty('--title-accent-shadow', palette.accentShadow || 'none');
  card.style.setProperty('--title-main-shadow', palette.mainShadow || 'none');
}

function generate() {
  clearTimeout(generateTimeout);
  generateTimeout = setTimeout(doGenerate, 20);
}

function doGenerate() {
  const sections = parseInput(document.getElementById('inputText').value);
  const template = getSelectedTemplate();
  const theme = getActiveTheme();
  const width = parseInt(document.getElementById('cardWidth').value, 10);
  const userScale = parseInt(document.getElementById('overallScale').value, 10) / 100;
  const headingScale = parseInt(document.getElementById('headingScale').value, 10) / 100;
  const tableSpacing = parseInt(document.getElementById('tableSpacing').value, 10) / 100;
  const format = document.getElementById('cardFormat').value;
  const totalRows = sections.reduce((sum, section) => sum + section.rows.length + (section.more ? parseInt(section.more, 10) : 0), 0);
  const naturalHeight = estimateNaturalHeight(template, sections, width, headingScale, tableSpacing);
  const borderWeight = document.getElementById('tableBorder').value;
  let formatMaxHeight = width * 1.25;
  if (format === '1:1') formatMaxHeight = width;
  else if (format === '9:16') formatMaxHeight = width * (16 / 9);
  else if (format === '16:9') formatMaxHeight = width * (9 / 16);

  const base = getTemplateBase(template, headingScale);
  const scale = (naturalHeight > formatMaxHeight ? formatMaxHeight / naturalHeight : 1) * userScale;
  const sizes = buildSizeMap(base, width, scale);
  const horizontalPad = Math.round(sizes.padLR * .42);
  const card = document.getElementById('card');
  const inner = document.getElementById('cardInner');
  const titleBlock = document.getElementById('titleBlock');
  const sebiLine = document.getElementById('sebiLine');
  const disclaimerBlock = document.getElementById('disclaimerDisplay');
  const container = document.getElementById('tablesContainer');
  const fragment = document.createDocumentFragment();

  card.className = `card template-${template} theme-${theme}`;
  card.style.width = `${width}px`;
  card.style.fontFamily = document.getElementById('fontFamily').value;
  card.style.setProperty('--table-bw', `${borderWeight}px`);
  setCardSurfaceVars(card, theme);
  setTitlePaletteVars(card, theme, template);
  bgApply((bgGetAll().find(item => item.id === bgActiveId) || {}).dataUrl || null);

  inner.style.padding = `${sizes.padTB}px ${sizes.padLR}px`;
  if (format !== 'auto') {
    card.style.height = `${formatMaxHeight}px`;
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    inner.style.justifyContent = 'flex-start';
    inner.style.height = '100%';
  } else {
    card.style.height = 'auto';
    inner.style.display = 'block';
    inner.style.height = 'auto';
  }

  sebiLine.textContent = `SEBI Reg. : ${document.getElementById('sebiReg').value}`;
  sebiLine.style.fontSize = `${sizes.sebiFz}px`;
  sebiLine.style.marginBottom = `${sizes.sebiMb}px`;
  makeEditable(sebiLine);

  titleBlock.style.marginBottom = `${sizes.titleMb}px`;
  titleBlock.innerHTML = `<span class="t-green" style="font-size:${sizes.titleFz}px">${totalRows} Profits </span><span class="t-white" style="font-size:${sizes.titleFz}px">Booked Today</span>`;
  makeEditable(titleBlock);

  disclaimerBlock.textContent = document.getElementById('disclaimer').value;
  disclaimerBlock.style.fontSize = `${sizes.discFz}px`;
  disclaimerBlock.style.marginTop = `${sizes.discMt}px`;
  makeEditable(disclaimerBlock);

  container.className = `template-container template-${template}`;
  container.innerHTML = '';

  if (customLogoData) {
    const logo = document.createElement('img');
    logo.src = customLogoData;
    logo.className = `card-logo ${customLogoPos}`;
    logo.style.transform = `scale(${scale})`;
    logo.style.transformOrigin = customLogoPos.includes('left') ? 'top left' : customLogoPos.includes('right') ? 'top right' : 'bottom center';
    fragment.appendChild(logo);
  }

  if (template === 'spotlight') renderSpotlightSections(fragment, sections, sizes, tableSpacing, horizontalPad);
  else if (template === 'stacked') renderStackedSections(fragment, sections, sizes, width, tableSpacing);
  else if (template === 'tagged') renderTaggedSections(fragment, sections, sizes, width, tableSpacing);
  else if (template === 'ribbon') renderRibbonSections(fragment, sections, sizes, width);
  else if (template === 'glass') renderGlassSections(fragment, sections, sizes, width);
  else if (template === 'editorial') renderEditorialSections(fragment, sections, sizes, width);
  else if (template === 'pillars') renderPillarSections(fragment, sections, sizes, width);
  else if (template === 'ledger') renderLedgerSections(fragment, sections, sizes, tableSpacing, horizontalPad);
  else if (template === 'mono') renderMonoSections(fragment, sections, sizes, width);
  else renderClassicSections(fragment, sections, sizes, tableSpacing, horizontalPad);

  container.appendChild(fragment);
}

function download() {
  html2canvas(document.getElementById('card'), { scale: 2, backgroundColor: null, useCORS: true }).then(canvas => {
    const anchor = document.createElement('a');
    let customName = document.getElementById('fileName').value.trim();
    if (!customName) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const date = new Date();
      customName = `Univest_Profit_Report_${date.getDate()}_${months[date.getMonth()]}`;
    }
    anchor.download = `${customName}.jpg`;
    anchor.href = canvas.toDataURL('image/jpeg', .95);
    anchor.click();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const primaryColor = document.getElementById('colorPrimary');
  const secondaryColor = document.getElementById('colorSecondary');
  const tertiaryColor = document.getElementById('colorTertiary');
  const primaryHex = document.getElementById('hexPrimary');
  const secondaryHex = document.getElementById('hexSecondary');
  const tertiaryHex = document.getElementById('hexTertiary');
  const dropZone = document.getElementById('bgDropZone');
  const dropLabel = document.getElementById('bgDropLabel');
  const removeLogoBtn = document.getElementById('removeLogo');
  const isValidHex = value => /^#[0-9A-F]{6}$/i.test(value);
  const globalFormat = { primary: { b: true, i: false, u: false }, secondary: { b: false, i: false, u: false }, tertiary: { b: true, i: false, u: false } };

  function setActivePreset(template) {
    document.querySelectorAll('.preset-btn').forEach(button => button.classList.toggle('active', button.getAttribute('data-template') === template));
    localStorage.setItem('designPreset', template);
  }

  function setThemeButtons(theme) {
    document.querySelectorAll('.theme-btn').forEach(button => button.classList.toggle('active', button.getAttribute('data-theme') === theme));
    localStorage.setItem('activeTheme', theme);
  }

  function updateColors(source) {
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
    localStorage.setItem('c3_primary', primaryColor.value);
    localStorage.setItem('c3_secondary', secondaryColor.value);
    localStorage.setItem('c3_tertiary', tertiaryColor.value);
  }

  function applyThemePalette(theme) {
    const palette = THEME_DEFAULTS[theme];
    primaryHex.value = palette.primary;
    secondaryHex.value = palette.secondary;
    tertiaryHex.value = palette.tertiary;
    updateColors(primaryHex);
    updateColors(secondaryHex);
    updateColors(tertiaryHex);
  }

  function syncFormats() {
    const card = document.getElementById('card');
    Object.entries(globalFormat).forEach(([category, value]) => {
      card.style.setProperty(`--fw-${category}`, value.b ? 'bold' : 'normal');
      card.style.setProperty(`--fs-${category}`, value.i ? 'italic' : 'normal');
      card.style.setProperty(`--td-${category}`, value.u ? 'underline' : 'none');
      document.querySelector(`.fmt-tog[data-cat="${category}"][data-fmt="b"]`).classList.toggle('active', value.b);
      document.querySelector(`.fmt-tog[data-cat="${category}"][data-fmt="i"]`).classList.toggle('active', value.i);
      document.querySelector(`.fmt-tog[data-cat="${category}"][data-fmt="u"]`).classList.toggle('active', value.u);
    });
    localStorage.setItem('globalFormat', JSON.stringify(globalFormat));
  }

  const savedPreset = localStorage.getItem('designPreset');
  if (savedPreset && document.querySelector(`.preset-btn[data-template="${savedPreset}"]`)) setActivePreset(savedPreset);

  const savedTheme = localStorage.getItem('activeTheme') || 'dark';
  setThemeButtons(savedTheme);

  const savedPrimary = localStorage.getItem('c3_primary');
  const savedSecondary = localStorage.getItem('c3_secondary');
  const savedTertiary = localStorage.getItem('c3_tertiary');
  if (savedPrimary && savedSecondary && savedTertiary) {
    primaryColor.value = savedPrimary;
    secondaryColor.value = savedSecondary;
    tertiaryColor.value = savedTertiary;
    primaryHex.value = savedPrimary;
    secondaryHex.value = savedSecondary;
    tertiaryHex.value = savedTertiary;
  } else {
    applyThemePalette(savedTheme);
  }
  updateColors();

  const savedFormatState = localStorage.getItem('globalFormat');
  if (savedFormatState) Object.assign(globalFormat, JSON.parse(savedFormatState));
  syncFormats();

  bgOpenDB().then(async db => {
    bgDB = db;
    bgLibrary = await bgLoadAll();
    const defaultBg = bgLibrary.find(item => item.isDefault);
    if (defaultBg) bgActiveId = defaultBg.id;
    bgRenderGrid();
    generate();
  }).catch(error => {
    console.warn('IndexedDB init failed. Backgrounds will not persist.', error);
    bgRenderGrid();
    generate();
  });

  document.querySelectorAll('.preset-btn').forEach(button => {
    button.addEventListener('click', () => {
      setActivePreset(button.getAttribute('data-template'));
      generate();
    });
  });

  document.getElementById('bgUploadInput').addEventListener('change', function () {
    if (this.files.length) bgHandleUpload(this.files);
    this.value = '';
  });

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropLabel.classList.add('drag-over'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropLabel.classList.remove('drag-over'), false);
  });

  dropZone.addEventListener('drop', event => {
    const imageFiles = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length) bgHandleUpload(imageFiles);
  });

  [primaryColor, secondaryColor, tertiaryColor].forEach(input => {
    input.addEventListener('input', () => {
      updateColors(input);
      generate();
    });
  });

  [primaryHex, secondaryHex, tertiaryHex].forEach(input => {
    input.addEventListener('input', () => updateColors(input));
    input.addEventListener('blur', () => {
      if (!input.value.startsWith('#')) input.value = `#${input.value}`;
      if (isValidHex(input.value)) {
        updateColors(input);
        generate();
      }
    });
  });

  document.querySelectorAll('.fmt-tog').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-cat');
      const format = button.getAttribute('data-fmt');
      globalFormat[category][format] = !globalFormat[category][format];
      syncFormats();
      generate();
    });
  });

  [['cardWidth', 'cardWidthVal', 'px'], ['overallScale', 'overallScaleVal', '%'], ['headingScale', 'headingScaleVal', '%'], ['tableSpacing', 'tableSpacingVal', '%']].forEach(([inputId, valueId, suffix]) => {
    document.getElementById(inputId).addEventListener('input', function () {
      document.getElementById(valueId).textContent = `${this.value}${suffix}`;
      generate();
    });
  });

  document.getElementById('tableBorder').addEventListener('input', function () {
    document.getElementById('tableBorderVal').textContent = `${this.value}px`;
    document.getElementById('card').style.setProperty('--table-bw', `${this.value}px`);
  });

  document.getElementById('cardFormat').addEventListener('change', generate);

  document.getElementById('logoUpload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      customLogoData = event.target.result;
      removeLogoBtn.style.display = 'inline-flex';
      generate();
    };
    reader.readAsDataURL(file);
  });

  removeLogoBtn.addEventListener('click', () => {
    customLogoData = null;
    removeLogoBtn.style.display = 'none';
    document.getElementById('logoUpload').value = '';
    generate();
  });

  document.getElementById('logoPos').addEventListener('change', event => {
    customLogoPos = event.target.value;
    generate();
  });

  document.querySelectorAll('.theme-btn').forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-theme');
      setThemeButtons(theme);
      applyThemePalette(theme);
      generate();
    });
  });

  document.getElementById('csvUpload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      let output = '';
      let currentCategory = '';
      event.target.result.split('\n').forEach(line => {
        const parts = line.split(',');
        if (parts.length < 4) return;
        const category = parts[0].trim().toUpperCase();
        const stock = parts[1].trim();
        const profit = parts[2].trim();
        const duration = parts[3].trim();
        if (!category || stock.toLowerCase() === 'stock name' || stock.toLowerCase() === 'stock') return;
        if (category !== currentCategory) {
          if (currentCategory) output += '\n';
          output += `${category}:\n`;
          currentCategory = category;
        }
        output += `${stock}: ${profit} in ${duration}\n`;
      });
      if (output) {
        document.getElementById('inputText').value = output;
        generate();
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  ['fontFamily', 'sebiReg'].forEach(id => document.getElementById(id).addEventListener('change', generate));
  document.getElementById('inputText').addEventListener('input', generate);
  document.getElementById('disclaimer').addEventListener('input', generate);

  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`tab-${button.getAttribute('data-tab')}`).classList.add('active');
    });
  });

  ['btnBold', 'btnItalic', 'btnUnderline'].forEach(id => {
    document.getElementById(id).addEventListener('mousedown', event => {
      event.preventDefault();
      document.execCommand(id.replace('btn', '').toLowerCase(), false, null);
    });
  });

  document.getElementById('btnHighlight').addEventListener('mousedown', event => {
    event.preventDefault();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, document.getElementById('highlightColor').value);
  });

  document.getElementById('cardWidthVal').textContent = `${document.getElementById('cardWidth').value}px`;
  document.getElementById('overallScaleVal').textContent = `${document.getElementById('overallScale').value}%`;
  document.getElementById('headingScaleVal').textContent = `${document.getElementById('headingScale').value}%`;
  document.getElementById('tableSpacingVal').textContent = `${document.getElementById('tableSpacing').value}%`;
  document.getElementById('tableBorderVal').textContent = `${document.getElementById('tableBorder').value}px`;
  document.getElementById('card').style.setProperty('--table-bw', `${document.getElementById('tableBorder').value}px`);
});
