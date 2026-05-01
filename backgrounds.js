let bgDB = null;
let bgLibrary = [];
let bgActiveId = null;
const BG_ACTIVE_KEY = 'profit_report_bg_active_v1';

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
    },
    board: {
      dark: 'linear-gradient(180deg, #07a44e 0%, #09bc5f 58%, #08733f 100%)',
      light: 'linear-gradient(180deg, #effaf1 0%, #dff5e8 50%, #f9fff9 100%)'
    },
  };

  return gradients[template]?.[theme] || gradients.classic.dark;
}

function bgApply(dataUrl) {
  const card = document.getElementById('card');
  if (!card) return;
  card.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : getDefaultCardBackground(getActiveTheme(), getSelectedTemplate());
  card.style.backgroundSize = dataUrl ? 'cover' : '100% 100%';
  card.style.backgroundPosition = 'center';
  card.style.backgroundRepeat = 'no-repeat';
}

function persistBgSelection() {
  try {
    if (bgActiveId) localStorage.setItem(BG_ACTIVE_KEY, bgActiveId);
    else localStorage.removeItem(BG_ACTIVE_KEY);
  } catch (_error) {
    // Ignore storage failures; background selection still works in-session.
  }
}

function restoreBgSelection() {
  try {
    return localStorage.getItem(BG_ACTIVE_KEY) || '';
  } catch (_error) {
    return '';
  }
}

function bgRenderGrid() {
  const grid = document.getElementById('bgGrid');
  const empty = document.getElementById('bgEmpty');
  if (!grid || !empty) return;

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
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onclick = () => {
      bgActiveId = background.id;
      persistBgSelection();
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
        persistBgSelection();
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
    persistBgSelection();
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

function bgInitialize() {
  const uploadInput = document.getElementById('bgUploadInput');
  const dropZone = document.getElementById('bgDropZone');
  const dropLabel = document.getElementById('bgDropLabel');

  if (!uploadInput || !dropZone || !dropLabel) return;

  bgOpenDB().then(async db => {
    bgDB = db;
    bgLibrary = await bgLoadAll();
    const defaultBg = bgLibrary.find(item => item.isDefault);
    const restored = restoreBgSelection();
    if (restored && bgGetAll().some(item => item.id === restored)) {
      bgActiveId = restored;
    } else if (defaultBg) {
      bgActiveId = defaultBg.id;
    }
    bgRenderGrid();
    generate();
  }).catch(() => {
    setAppNotice?.('Background storage is unavailable. Using the default card surface.', 'error');
    bgRenderGrid();
    generate();
  });

  uploadInput.addEventListener('change', function () {
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
}

bgInitialize();
window.getBackgroundSelection = () => bgActiveId;
window.setBackgroundSelection = id => {
  if (!id) {
    bgActiveId = null;
    persistBgSelection();
    bgRenderGrid();
    return;
  }
  const item = bgGetAll().find(background => background.id === id);
  if (!item) return;
  bgActiveId = id;
  persistBgSelection();
  bgRenderGrid();
};
