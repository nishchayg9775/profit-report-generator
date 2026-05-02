const COL_HEADERS = {
  EQUITY: ['STOCK NAME', 'RETURNS', 'DURATION'],
  FUTURES: ['STOCK NAME', 'RETURNS/LOT', 'DURATION'],
  OPTIONS: ['STOCK NAME', 'RETURNS/STRATEGY', 'DURATION'],
  COMMODITY: ['STOCK NAME', 'RETURNS', 'DURATION']
};

const SECTION_ORDER = { EQUITY: 0, OPTIONS: 1, FUTURES: 2, COMMODITY: 3 };
const ACTIVE_TEMPLATES = ['classic', 'spotlight', 'ledger', 'board', 'ribbon', 'glass', 'pillars', 'mono'];
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
  pillars: {
    dark: { accent: '#ffb347', main: '#f4f6ff', accentShadow: '0 0 24px rgba(255,179,71,.16)', mainShadow: '0 10px 26px rgba(123,77,255,.12)' },
    light: { accent: '#7c4dff', main: '#1a1f2c', accentShadow: '0 10px 22px rgba(124,77,255,.14)', mainShadow: 'none' }
  },
  mono: {
    dark: { accent: '#9ef9ea', main: '#f1f5ff', accentShadow: '0 0 22px rgba(158,249,234,.16)', mainShadow: '0 10px 24px rgba(0,0,0,.16)' },
    light: { accent: '#0f79ff', main: '#101726', accentShadow: '0 10px 22px rgba(15,121,255,.12)', mainShadow: 'none' }
  },
  board: {
    dark: { accent: '#ffd34d', main: '#fffdf4', accentShadow: '0 0 24px rgba(255,211,77,.22)', mainShadow: '0 10px 24px rgba(0,0,0,.18)' },
    light: { accent: '#166c39', main: '#173123', accentShadow: '0 10px 22px rgba(22,108,57,.14)', mainShadow: 'none' }
  },
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
let lastParseModel = null;
let parseReviewExpanded = false;
let appHistory = [];
let appHistoryIndex = -1;
let appStateSaveTimeout = 0;
let appStateHydrating = true;
let generateFrame = 0;
let generateSerial = 0;
let latestGeneratePromise = Promise.resolve();

const APP_STATE_KEY = 'profit_report_app_state_v2';
const APP_HISTORY_KEY = 'profit_report_app_history_v1';
const APP_HISTORY_LIMIT = 25;

function cleanInputLine(rawLine) {
  return rawLine
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[•●]/g, '*')
    .trim();
}

function normalizeSectionName(rawName) {
  const name = rawName.replace(/\*/g, '').trim().toUpperCase();
  if (name === 'EQUITIES' || name === 'EQUITY') return 'EQUITY';
  if (name === 'FUTURE' || name === 'FUTURES') return 'FUTURES';
  if (name === 'OPTION' || name === 'OPTIONS') return 'OPTIONS';
  if (name.startsWith('COMMOD')) return 'COMMODITY';
  return name;
}

function normalizeDuration(duration) {
  let normalized = duration.trim();
  normalized = normalized.replace(/^(?:the\s+)?same day$/i, 'Same Day');
  normalized = normalized.replace(/^(?:just|only|the)\s+/i, '');
  return normalized
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizeReturns(returns, sectionName) {
  let normalized = returns.trim().replace(/\s+/g, ' ');

  if (/futures/i.test(sectionName)) {
    let sign = '';
    if (normalized.startsWith('-')) {
      sign = '-';
      normalized = normalized.slice(1).trim();
    }

    normalized = normalized
      .replace(/â‚¹|₹/g, '')
      .replace(/^rs\.?\s*/i, '')
      .replace(/^inr\s*/i, '')
      .replace(/\/-\s*/g, '')
      .replace(/\bper\s*lot\b/ig, '')
      .trim();

    const numeric = normalized.replace(/,/g, '');
    if (/^\d+(?:\.\d+)?$/.test(numeric)) {
      const [whole, fraction] = numeric.split('.');
      const formatted = Number(whole).toLocaleString('en-IN') + (fraction ? `.${fraction}` : '');
      return `${sign}â‚¹${formatted}`;
    }

    return `${sign}â‚¹${normalized}`.trim();
  }

  if (!normalized.includes('%')) return `${normalized}%`;
  return normalized;
}

function parseInput(text) {
  const sections = [];
  let currentSection = null;

  for (const rawLine of text.split('\n')) {
    const line = cleanInputLine(rawLine);
    if (!line) continue;

    const plainLine = line.replace(/\*/g, '').trim();
    const sectionMatch = plainLine.match(/^(Equit(?:y|ies)|Futures?|Options?|Commodity)\s*(?:\((\d+)\))?\s*:?\s*$/i);
    if (sectionMatch) {
      currentSection = { name: normalizeSectionName(sectionMatch[1]), rows: [] };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) continue;

    const moreMatch = plainLine.match(/^[+&]\s*(\d+)\s+more/i);
    if (moreMatch) {
      currentSection.more = `+${moreMatch[1]} more`;
      continue;
    }

    const entryLine = plainLine.replace(/^[\-\*]+\s*/, '').trim();
    const rowMatch = entryLine.match(/^(.+?)(?:\s*[:\-–]\s*)(.+?)\s+(?:in\s+|on\s+)(.+)$/i);
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

function normalizeParsedReturn(returns, sectionName) {
  let normalized = returns.trim().replace(/\s+/g, ' ');

  if (/futures/i.test(sectionName)) {
    const sign = normalized.startsWith('-') ? '-' : '';
    const compact = normalized
      .replace(/\/-\s*/g, '')
      .replace(/\bper\s*lot\b/ig, '')
      .trim();
    const numeric = compact.replace(/[^0-9.,]/g, '').replace(/,/g, '');

    if (/^\d+(?:\.\d+)?$/.test(numeric)) {
      const [whole, fraction] = numeric.split('.');
      const formatted = Number(whole).toLocaleString('en-IN') + (fraction ? `.${fraction}` : '');
      return `${sign}Rs. ${formatted}`;
    }

    const stripped = compact.replace(/^[^\d-]+/, '').trim();
    return `${sign}Rs. ${stripped || compact}`.trim();
  }

  if (!normalized.includes('%')) return `${normalized}%`;
  return normalized;
}

function parseInput(text) {
  const sections = [];
  let currentSection = null;

  for (const rawLine of text.split('\n')) {
    const line = cleanInputLine(rawLine);
    if (!line) continue;

    const plainLine = line.replace(/\*/g, '').trim();
    const sectionMatch = plainLine.match(/^(Equit(?:y|ies)|Futures?|Options?|Commodity)\s*(?:\((\d+)\))?\s*:?\s*$/i);
    if (sectionMatch) {
      currentSection = { name: normalizeSectionName(sectionMatch[1]), rows: [] };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) continue;

    const moreMatch = plainLine.match(/^[+&]\s*(\d+)\s+more/i);
    if (moreMatch) {
      currentSection.more = `+${moreMatch[1]} more`;
      continue;
    }

    const entryLine = plainLine.replace(/^[\-\*]+\s*/, '').trim();
    const rowMatch = entryLine.match(/^(.+?)(?:\s*[:\-\u2013\u2014]\s*)(.+?)\s+(?:in\s+|on\s+)(.+)$/i);
    if (!rowMatch) continue;

    currentSection.rows.push({
      name: rowMatch[1].trim().replace(/\s+/g, ' ').toUpperCase(),
      returns: normalizeParsedReturn(rowMatch[2], currentSection.name),
      duration: normalizeDuration(rowMatch[3])
    });
  }

  return sections.sort((a, b) => (SECTION_ORDER[a.name] ?? 99) - (SECTION_ORDER[b.name] ?? 99));
}

function cleanInputLine(rawLine) {
  return String(rawLine || '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[•●▪◦‣]/g, '*')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSectionName(rawName) {
  const name = rawName.replace(/[^A-Za-z]/g, '').trim().toUpperCase();
  if (name === 'EQUITIES' || name === 'EQUITY') return 'EQUITY';
  if (name === 'FUTURE' || name === 'FUTURES') return 'FUTURES';
  if (name === 'OPTION' || name === 'OPTIONS') return 'OPTIONS';
  if (name.startsWith('COMMOD')) return 'COMMODITY';
  return name;
}

function titleCaseLoose(value) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, match => match.toUpperCase())
    .replace(/\bMins\b/g, 'Mins')
    .replace(/\bMin\b/g, 'Min')
    .replace(/\bHrs\b/g, 'Hrs')
    .replace(/\bHr\b/g, 'Hr');
}

function normalizeDuration(duration) {
  let normalized = duration.trim();
  normalized = normalized.replace(/^(?:in|on)\s+/i, '');
  normalized = normalized.replace(/^(?:the\s+)?same day$/i, 'Same Day');
  normalized = normalized.replace(/^(?:just|only|the)\s+/i, '');
  return titleCaseLoose(normalized)
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase();
      if (lower === 'minutes' || lower === 'minute' || lower === 'mins') return 'Mins';
      if (lower === 'hours' || lower === 'hour' || lower === 'hrs') return lower === 'hrs' ? 'Hrs' : titleCaseLoose(lower);
      return word;
    })
    .join(' ');
}

function normalizeTradeName(name) {
  return name
    .replace(/^[#*+\-.()\d\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function isCurrencyReturn(value, sectionName) {
  return /futures/i.test(sectionName) || /(?:₹|rs\.?|inr|\/-|\bper\s*lot\b)/i.test(value);
}

function normalizeParsedReturn(returns, sectionName) {
  let normalized = returns.trim().replace(/\s+/g, ' ');

  if (isCurrencyReturn(normalized, sectionName)) {
    const sign = normalized.startsWith('-') ? '-' : '';
    normalized = normalized
      .replace(/^[-+]\s*/, '')
      .replace(/₹/g, '')
      .replace(/^rs\.?\s*/i, '')
      .replace(/^inr\s*/i, '')
      .replace(/\/-\s*/g, '')
      .replace(/\bper\s*lot\b/ig, '')
      .trim();

    const numeric = normalized.replace(/,/g, '');
    if (/^\d+(?:\.\d+)?$/.test(numeric)) {
      const [whole, fraction] = numeric.split('.');
      const formatted = Number(whole).toLocaleString('en-IN') + (fraction ? `.${fraction}` : '');
      return `${sign}Rs. ${formatted}`;
    }

    return `${sign}Rs. ${normalized}`.trim();
  }

  normalized = normalized.replace(/\bpercent\b/ig, '%').trim();
  if (!normalized.includes('%') && /^[-+]?\d+(?:\.\d+)?$/.test(normalized.replace(/,/g, ''))) return `${normalized}%`;
  return normalized;
}

function detectSectionHeader(line) {
  return line.match(/^(Equit(?:y|ies)|Futures?|Options?|Commodity)\s*(?:\(\s*(\d+)\s*\))?\s*:?\s*$/i);
}

function splitDurationSegment(line) {
  const lower = line.toLowerCase();
  const markers = [' in just ', ' in only ', ' in ', ' on '];
  let splitIndex = -1;
  let splitMarker = '';

  markers.forEach(marker => {
    const markerIndex = lower.lastIndexOf(marker);
    if (markerIndex > splitIndex) {
      splitIndex = markerIndex;
      splitMarker = marker;
    }
  });

  if (splitIndex === -1) return null;
  return {
    left: line.slice(0, splitIndex).trim(),
    duration: line.slice(splitIndex + splitMarker.length).trim()
  };
}

function splitNameAndReturn(line) {
  const explicitMatch = line.match(/^(.+?)(?:\s*[:\-]\s*)(.+)$/);
  if (explicitMatch) {
    return {
      name: explicitMatch[1].trim(),
      returns: explicitMatch[2].trim()
    };
  }

  const looseMatch = line.match(/^(.*?)([-+]?(?:Rs\.?|INR|₹)?\s*\d[\d,]*(?:\.\d+)?(?:\s*\/-\s*)?(?:\s*PER LOT)?|[-+]?\d+(?:\.\d+)?%)$/i);
  if (looseMatch) {
    return {
      name: looseMatch[1].trim(),
      returns: looseMatch[2].trim()
    };
  }

  return null;
}

function parseRowLine(line, sectionName) {
  const normalizedLine = line.replace(/^[*+\-]+\s*/, '').trim();
  const durationParts = splitDurationSegment(normalizedLine);
  if (!durationParts) return null;

  const rowParts = splitNameAndReturn(durationParts.left);
  if (!rowParts) return null;

  const name = normalizeTradeName(rowParts.name);
  if (!name) return null;

  return {
    name,
    returns: normalizeParsedReturn(rowParts.returns, sectionName),
    duration: normalizeDuration(durationParts.duration)
  };
}

function isLikelyDateLabel(text) {
  return /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/i.test(text) || /\b\d{1,2}(?:st|nd|rd|th)?\b/i.test(text);
}

function extractTitleMeta(line) {
  const compact = line.replace(/^[*#\s]+|[*#\s]+$/g, '').trim();
  if (!compact || !/(profit|trade|pick|booked|till now|today|report)/i.test(compact)) return null;

  const parts = compact.split(/\s*[-|]\s*/).filter(Boolean);
  let dateLabel = '';
  let titleLine = compact;

  if (parts.length > 1) {
    const titleIndex = parts.findIndex(part => /(profit|trade|pick|booked|till now|today|report)/i.test(part));
    if (titleIndex !== -1) {
      titleLine = parts[titleIndex];
      const prefix = parts.slice(0, titleIndex).join(' ').trim();
      if (prefix && isLikelyDateLabel(prefix)) dateLabel = titleCaseLoose(prefix);
    }
  }

  const totalMatch = titleLine.match(/(\d+)\s+(.*)$/);
  return {
    rawLine: compact,
    dateLabel,
    totalHint: totalMatch ? parseInt(totalMatch[1], 10) : null,
    titleBody: titleCaseLoose((totalMatch ? totalMatch[2] : titleLine).trim())
  };
}

function buildMetaFromPreamble(lines) {
  const meta = {
    dateLabel: '',
    totalHint: null,
    titleBody: '',
    rawTitle: '',
    extraLines: []
  };

  lines.forEach(line => {
    const titleMeta = extractTitleMeta(line);
    if (titleMeta && !meta.rawTitle) {
      meta.dateLabel = titleMeta.dateLabel;
      meta.totalHint = titleMeta.totalHint;
      meta.titleBody = titleMeta.titleBody;
      meta.rawTitle = titleMeta.rawLine;
      return;
    }
    meta.extraLines.push(titleCaseLoose(line));
  });

  return meta;
}

function buildNormalizedText(meta, sections) {
  const lines = [];

  if (meta.rawTitle) {
    const titleLine = meta.totalHint && meta.titleBody
      ? `${meta.totalHint} ${meta.titleBody}`
      : meta.rawTitle;
    lines.push(meta.dateLabel ? `${meta.dateLabel} - ${titleLine}` : titleLine);
    lines.push('');
  }

  sections.forEach(section => {
    lines.push(`${titleCaseLoose(section.name)}:`);
    section.rows.forEach(row => {
      lines.push(`${row.name} - ${row.returns} in ${row.duration}`);
    });
    if (section.more) lines.push(section.more);
    lines.push('');
  });

  return lines.join('\n').trim();
}

function parseInputModel(text) {
  const sections = [];
  const preambleLines = [];
  const unmatchedLines = [];
  let currentSection = null;

  text.split('\n').forEach(rawLine => {
    const line = cleanInputLine(rawLine);
    if (!line) return;

    const plainLine = line.replace(/\*/g, '').trim();
    const sectionMatch = detectSectionHeader(plainLine);
    if (sectionMatch) {
      currentSection = {
        name: normalizeSectionName(sectionMatch[1]),
        rows: [],
        expectedCount: sectionMatch[2] ? parseInt(sectionMatch[2], 10) : null
      };
      sections.push(currentSection);
      return;
    }

    if (!currentSection) {
      preambleLines.push(plainLine);
      return;
    }

    const moreMatch = plainLine.match(/^[+&]\s*(\d+)\s+more/i);
    if (moreMatch) {
      currentSection.more = `+${moreMatch[1]} more`;
      return;
    }

    const row = parseRowLine(plainLine, currentSection.name);
    if (row) {
      currentSection.rows.push(row);
      return;
    }

    unmatchedLines.push(plainLine);
  });

  const sortedSections = sections.sort((a, b) => (SECTION_ORDER[a.name] ?? 99) - (SECTION_ORDER[b.name] ?? 99));
  const moreRows = sortedSections.reduce((sum, section) => sum + (section.more ? parseInt(section.more, 10) || 0 : 0), 0);
  const parsedRows = sortedSections.reduce((sum, section) => sum + section.rows.length, 0) + moreRows;
  const confidence = parsedRows ? Math.max(0.45, parsedRows / Math.max(parsedRows + unmatchedLines.length, 1)) : 0;
  const meta = buildMetaFromPreamble(preambleLines);

  return {
    meta,
    sections: sortedSections,
    unmatchedLines,
    parsedRows,
    confidence,
    normalizedText: buildNormalizedText(meta, sortedSections)
  };
}

function parseInput(text) {
  return parseInputModel(text).sections;
}

function getDisplayTitleParts(parseModel) {
  const totalRows = parseModel.uniqueRows || parseModel.tradeSummary?.uniqueRows || parseModel.parsedRows || parseModel.meta.totalHint || 0;
  const defaultBody = 'Profits Booked Today';
  const titleBody = parseModel.meta.titleBody || defaultBody;
  const words = titleBody.split(/\s+/).filter(Boolean);
  const leadWord = words[0] && /(profit|trade|pick|gain|return)/i.test(words[0]) ? titleCaseLoose(words[0]) : 'Profits';
  const trailingWords = words[0] && /(profit|trade|pick|gain|return)/i.test(words[0]) ? words.slice(1) : words;

  return {
    count: totalRows ? String(totalRows) : '',
    leadWord,
    main: trailingWords.length ? titleCaseLoose(trailingWords.join(' ')) : 'Booked Today'
  };
}

function updateSmartParseUI(parseModel) {
  const summary = document.getElementById('parseSummary');
  const detail = document.getElementById('parseMeta');
  const confidence = document.getElementById('parseConfidence');
  const chips = document.getElementById('parseChips');
  const statHigh = document.getElementById('statHigh');
  const statMedium = document.getElementById('statMedium');
  const statLow = document.getElementById('statLow');
  const warningBox = document.getElementById('parseWarningBox');
  const warningList = document.getElementById('parseWarningList');
  const reviewBox = document.getElementById('parseReviewBox');
  const reviewPanel = document.getElementById('parseReviewPanel');
  const reviewList = document.getElementById('parseReviewList');
  const preview = document.getElementById('normalizedPreview');
  const normalizeButton = document.getElementById('normalizeInput');

  if (!summary || !detail || !confidence || !chips || !warningBox || !warningList || !reviewBox || !reviewPanel || !reviewList || !preview) return;

  const hasInput = document.getElementById('inputText').value.trim().length > 0;
  const sectionCount = parseModel.sections.length;
  const issueCount = parseModel.reviewItems?.length || parseModel.unmatchedLines.length;
  const visibleRows = parseModel.visibleRows ?? Math.max(0, (parseModel.parsedRows || 0) - (parseModel.hiddenRows || 0));
  const hiddenRows = parseModel.hiddenRows || 0;
  const duplicateRows = parseModel.duplicateRows || 0;
  const breakdownParts = [];

  if (visibleRows) breakdownParts.push(`${visibleRows} visible`);
  if (hiddenRows) breakdownParts.push(`${hiddenRows} hidden`);
  if (duplicateRows) breakdownParts.push(`${duplicateRows} duplicate${duplicateRows === 1 ? '' : 's'}`);

  if (!hasInput) {
    summary.textContent = 'Paste trade text and smart parse will auto-detect the format';
    detail.textContent = 'WhatsApp stars, plain sections, bullets, colons, hyphens, and futures amounts all get normalized here.';
    confidence.textContent = 'Waiting';
    confidence.dataset.state = 'idle';
    chips.replaceChildren();
    if (statHigh) statHigh.textContent = '0';
    if (statMedium) statMedium.textContent = '0';
    if (statLow) statLow.textContent = '0';
    preview.value = '';
    if (normalizeButton) normalizeButton.disabled = true;
    warningList.replaceChildren();
    warningBox.classList.add('is-hidden');
    parseReviewExpanded = false;
    reviewList.replaceChildren();
    reviewBox.classList.add('is-hidden');
    syncParseReviewUI(0);
    return;
  }

  summary.textContent = parseModel.parsedRows
    ? `${parseModel.parsedRows} trade rows detected across ${sectionCount} section${sectionCount === 1 ? '' : 's'}${breakdownParts.length ? ` (${breakdownParts.join(' | ')})` : ''}`
    : 'No trade rows detected yet';

  if (parseModel.meta.rawTitle || parseModel.meta.dateLabel) {
    const titleLine = parseModel.meta.titleBody ? `${parseModel.uniqueRows || parseModel.tradeSummary?.uniqueRows || parseModel.parsedRows || parseModel.meta.totalHint || ''} ${parseModel.meta.titleBody}`.trim() : parseModel.meta.rawTitle;
    detail.textContent = parseModel.meta.dateLabel
      ? `Detected heading: ${titleLine} | Date: ${parseModel.meta.dateLabel}`
      : `Detected heading: ${titleLine}`;
  } else if (issueCount) {
    detail.textContent = `${issueCount} line${issueCount === 1 ? '' : 's'} could not be mapped cleanly. ${breakdownParts.length ? `Breakdown: ${breakdownParts.join(' | ')}.` : 'Review them below.'}`;
  } else {
    detail.textContent = breakdownParts.length
      ? `Visible rows are ready for export. ${breakdownParts.join(' | ')}.`
      : 'Input successfully normalized into the app format.';
  }

  confidence.textContent = issueCount ? `${issueCount} to review` : `${Math.round((parseModel.confidence || 0) * 100)}% ready`;
  confidence.dataset.state = issueCount ? 'warn' : parseModel.parsedRows ? 'good' : 'idle';

  chips.replaceChildren(...parseModel.sections.map(section => {
    const chip = document.createElement('span');
    chip.className = 'parse-chip';
    chip.append(document.createTextNode(`${titleCaseLoose(section.name)} `));
    const strong = document.createElement('strong');
    strong.textContent = String(section.rows.length);
    chip.appendChild(strong);
    return chip;
  }));
  if (statHigh) statHigh.textContent = String(parseModel.lineStats?.high || 0);
  if (statMedium) statMedium.textContent = String(parseModel.lineStats?.medium || 0);
  if (statLow) statLow.textContent = String(parseModel.lineStats?.low || 0);

  preview.value = parseModel.normalizedText;
  if (normalizeButton) normalizeButton.disabled = !parseModel.normalizedText;
  warningList.replaceChildren(...parseModel.unmatchedLines.slice(0, 6).map(line => createTextBlock('parse-warning-item', line)));
  warningBox.classList.toggle('is-hidden', !parseModel.unmatchedLines.length);

  reviewList.replaceChildren(...(parseModel.reviewItems || []).map((item, index) => {
    const review = document.createElement('div');
    review.className = 'parse-review-item';
    review.appendChild(createTextBlock('parse-review-line', item.rawLine));
    review.appendChild(createTextBlock(
      'parse-review-meta',
      `${item.reason.replace(/-/g, ' ')} | ${item.confidenceLabel} confidence${item.sectionName ? ` | ${titleCaseLoose(item.sectionName)}` : ''}`
    ));
    if (item.suggestion) {
      review.appendChild(createTextBlock('parse-review-suggestion', `Suggested: ${item.suggestion}`));
    } else if (item.mergeSuggestion) {
      review.appendChild(createTextBlock('parse-review-suggestion', `Merge suggestion: ${item.mergeSuggestion}`));
    }
    if (item.suggestion) {
      const actions = document.createElement('div');
      actions.className = 'parse-review-actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-secondary btn-compact apply-suggestion-btn';
      button.dataset.reviewIndex = String(index);
      button.textContent = 'Apply Suggestion';
      actions.appendChild(button);
      review.appendChild(actions);
    }
    return review;
  }));
  reviewBox.classList.toggle('is-hidden', !(parseModel.reviewItems || []).length);
  if (!(parseModel.reviewItems || []).length) parseReviewExpanded = false;
  syncParseReviewUI((parseModel.reviewItems || []).length);
}

function syncPreviewAreaLayout() {
  const previewArea = document.querySelector('.preview-area');
  const previewStage = document.getElementById('previewStage');
  const previewFrame = document.getElementById('previewFrame');
  const card = document.getElementById('card');
  if (!previewArea || !previewStage || !previewFrame || !card) return;

  const availableHeight = Math.max(0, previewArea.clientHeight - 44);
  const cardWidth = Math.max(1, card.offsetWidth || Math.ceil(card.getBoundingClientRect().width));
  const cardHeight = Math.max(1, card.offsetHeight || Math.ceil(card.getBoundingClientRect().height));
  const availableWidth = Math.max(0, previewArea.clientWidth - 32);
  const scale = Math.min(1, availableWidth / cardWidth);
  const isTall = cardHeight > availableHeight;

  previewFrame.style.width = `${cardWidth}px`;
  previewFrame.style.height = `${cardHeight}px`;
  previewFrame.style.transform = `scale(${scale})`;
  previewStage.style.width = `${Math.max(1, Math.round(cardWidth * scale))}px`;
  previewStage.style.height = `${Math.max(1, Math.round(cardHeight * scale))}px`;

  previewArea.classList.toggle('preview-is-tall', isTall);
  previewArea.classList.toggle('preview-is-short', !isTall);
  if (isTall) previewArea.scrollTop = 0;
}

function getParserApi() {
  return window.smartParser || {
    parseInputModel,
    parseInputModelAsync: async text => parseInputModel(text),
    parseInput,
    learnCorrections() {},
  };
}

window.waitForStablePreview = () => latestGeneratePromise.catch(() => {});

function syncParseReviewUI(reviewCount) {
  const reviewBox = document.getElementById('parseReviewBox');
  const reviewPanel = document.getElementById('parseReviewPanel');
  const reviewToggle = document.getElementById('parseReviewToggle');
  const reviewCountLabel = document.getElementById('parseReviewCount');
  const applyAllButton = document.getElementById('applyAllSuggestions');

  if (!reviewBox || !reviewPanel || !reviewToggle || !reviewCountLabel || !applyAllButton) return;

  reviewCountLabel.textContent = `${reviewCount}`;
  reviewBox.classList.toggle('is-expanded', parseReviewExpanded && reviewCount > 0);
  reviewPanel.classList.toggle('is-hidden', !(parseReviewExpanded && reviewCount > 0));
  reviewToggle.setAttribute('aria-expanded', parseReviewExpanded && reviewCount > 0 ? 'true' : 'false');
  applyAllButton.disabled = !(lastParseModel?.reviewItems || []).some(item => item.suggestion);
}

function replaceInputLine(rawLine, nextLine) {
  const input = document.getElementById('inputText');
  const lines = input.value.split(/\r?\n/);
  const index = lines.findIndex(line => line.trim() === rawLine.trim());
  if (index !== -1) {
    lines[index] = nextLine;
    input.value = lines.join('\n');
  }
}

function applyReviewSuggestion(index) {
  const item = lastParseModel?.reviewItems?.[index];
  if (!item?.suggestion) return;
  const parser = getParserApi();
  if (parser.learnCorrections) parser.learnCorrections([{ rawLine: item.rawLine, suggestion: item.suggestion }]);
  replaceInputLine(item.rawLine, item.suggestion);
  generate();
}

function applyAllReviewSuggestions() {
  const suggestions = (lastParseModel?.reviewItems || []).filter(item => item.suggestion);
  if (!suggestions.length) return;

  const parser = getParserApi();
  if (parser.learnCorrections) parser.learnCorrections(suggestions.map(item => ({ rawLine: item.rawLine, suggestion: item.suggestion })));

  const input = document.getElementById('inputText');
  const lines = input.value.split(/\r?\n/);
  const suggestionQueues = new Map();

  suggestions.forEach(item => {
    const key = item.rawLine.trim();
    if (!suggestionQueues.has(key)) suggestionQueues.set(key, []);
    suggestionQueues.get(key).push(item.suggestion);
  });

  input.value = lines
    .map(line => {
      const key = line.trim();
      const queue = suggestionQueues.get(key);
      if (queue && queue.length) return queue.shift();
      return line;
    })
    .join('\n');

  generate();
}

function getTemplateBase(template, headingScale) {
  if (template === 'spotlight') {
    return { padTB: .03, padLR: .05, sebiFz: .017, sebiMb: .008, titleFz: .069 * headingScale, titleMb: .018 * headingScale, secFz: .0165, secMt: .022, secMb: .01, thFz: .0155, thPad: .011, tdFz: .0185, tdPad: .01, discFz: .0118, discMt: .022, shellPad: .018, metaFz: .011 };
  }
  if (template === 'board') {
    return { padTB: .028, padLR: .045, sebiFz: .0165, sebiMb: .008, titleFz: .066 * headingScale, titleMb: .017 * headingScale, secFz: .0138, secMt: .014, secMb: .008, thFz: .0105, thPad: .0075, tdFz: .0165, tdPad: .0075, discFz: .0102, discMt: .012, shellPad: .012, metaFz: .009 };
  }
  if (template === 'stacked') {
    return { padTB: .033, padLR: .046, sebiFz: .017, sebiMb: .009, titleFz: .07 * headingScale, titleMb: .022 * headingScale, secFz: .015, secMt: .018, secMb: .009, thFz: .012, thPad: .01, tdFz: .019, tdPad: .009, discFz: .012, discMt: .02, shellPad: .018, metaFz: .01 };
  }
  if (template === 'tagged') {
    return { padTB: .033, padLR: .05, sebiFz: .017, sebiMb: .009, titleFz: .07 * headingScale, titleMb: .022 * headingScale, secFz: .015, secMt: .02, secMb: .01, thFz: .0115, thPad: .009, tdFz: .0185, tdPad: .0095, discFz: .0115, discMt: .02, shellPad: .019, metaFz: .01 };
  }
  if (template === 'ribbon') {
    return { padTB: .03, padLR: .043, sebiFz: .0165, sebiMb: .008, titleFz: .066 * headingScale, titleMb: .018 * headingScale, secFz: .0138, secMt: .013, secMb: .008, thFz: .0105, thPad: .0078, tdFz: .017, tdPad: .0082, discFz: .0102, discMt: .012, shellPad: .013, metaFz: .009 };
  }
  if (template === 'glass') {
    return { padTB: .032, padLR: .046, sebiFz: .0165, sebiMb: .008, titleFz: .067 * headingScale, titleMb: .02 * headingScale, secFz: .014, secMt: .013, secMb: .008, thFz: .0105, thPad: .0078, tdFz: .017, tdPad: .0082, discFz: .0102, discMt: .012, shellPad: .013, metaFz: .009 };
  }
  if (template === 'pillars') {
    return { padTB: .031, padLR: .044, sebiFz: .0165, sebiMb: .008, titleFz: .064 * headingScale, titleMb: .018 * headingScale, secFz: .0142, secMt: .013, secMb: .008, thFz: .0105, thPad: .0078, tdFz: .017, tdPad: .0082, discFz: .0102, discMt: .012, shellPad: .013, metaFz: .009 };
  }
  if (template === 'ledger') {
    return { padTB: .03, padLR: .042, sebiFz: .016, sebiMb: .008, titleFz: .062 * headingScale, titleMb: .017 * headingScale, secFz: .0138, secMt: .012, secMb: .007, thFz: .011, thPad: .008, tdFz: .0162, tdPad: .0075, discFz: .010, discMt: .011, shellPad: .012, metaFz: .009 };
  }
  if (template === 'mono') {
    return { padTB: .031, padLR: .044, sebiFz: .0165, sebiMb: .008, titleFz: .065 * headingScale, titleMb: .018 * headingScale, secFz: .014, secMt: .013, secMb: .008, thFz: .0105, thPad: .0078, tdFz: .0168, tdPad: .008, discFz: .0102, discMt: .012, shellPad: .013, metaFz: .009 };
  }
  return { padTB: .024, padLR: .044, sebiFz: .0165, sebiMb: .006, titleFz: .072 * headingScale, titleMb: .012 * headingScale, secFz: .0155, secMt: .012, secMb: .006, thFz: .0145, thPad: .009, tdFz: .0178, tdPad: .0076, discFz: .0108, discMt: .01, shellPad: .012, metaFz: .01 };
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
  if (template === 'board') return width >= 960 ? Math.min(3, sectionCount) : width >= 620 ? 2 : 1;
  if (template === 'ribbon') return width >= 620 ? Math.min(2, sectionCount) : 1;
  if (template === 'glass') return width >= 920 ? Math.min(3, sectionCount) : width >= 620 ? 2 : 1;
  if (template === 'pillars') return width >= 620 ? Math.min(2, sectionCount) : 1;
  if (template === 'mono') return width >= 620 ? 2 : 1;
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

  if (template === 'board') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2.1 + px(base.secFz) * 1.12 + px(base.thFz) * 1.25 + section.rows.length * (px(base.tdFz) * 1.3 + px(base.tdPad) * 2) + (section.more ? px(base.tdFz) * .96 : px(base.secMt) * .3));
    const gridHeight = estimateGridHeight(sectionHeights, columns, sectionGap);
    return px(base.padTB) * 2 + px(base.sebiFz) + px(base.sebiMb) + px(base.titleFz) * 1.05 + px(base.titleMb) + gridHeight + px(base.discFz) * 2.9 + px(base.discMt);
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

  if (template === 'pillars') {
    const columns = getPresetGridColumns(template, width, sections.length);
    const sectionHeights = sections.map(section => px(base.shellPad) * 2.8 + px(base.secFz) * 1.55 + section.rows.length * (px(base.tdFz) * 1.34 + px(base.tdPad) * 1.8) + (section.more ? px(base.tdFz) * 1.05 : px(base.secMt) * .32));
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
    label.style.marginTop = `${Math.max(4, Math.round(sizes.secMt * tableSpacing * 0.72))}px`;
    label.style.marginBottom = `${Math.max(2, Math.round(sizes.secMb * 0.75))}px`;
    fragment.appendChild(label);

    const headers = COL_HEADERS[section.name] || COL_HEADERS.EQUITY;
    const table = buildDataTable(headers, section.rows, sizes, horizontalPad);
    table.style.marginBottom = section.more ? '0px' : `${Math.max(2, Math.round(sizes.secMt * Math.max(tableSpacing - 1, 0) * 0.45))}px`;
    fragment.appendChild(table);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .78));
      more.style.marginTop = `${Math.max(2, Math.round(sizes.tdPad * .45))}px`;
      more.style.marginBottom = `${Math.max(4, Math.round(sizes.secMt * tableSpacing * 0.68))}px`;
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
    columns.replaceChildren(
      createTextSpan('', '#'),
      createTextSpan('', 'Stock'),
      createTextSpan('', 'Time'),
      createTextSpan('stacked-col-return', 'Return')
    );
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

function renderBoardSections(fragment, sections, sizes, width) {
  const columns = getPresetGridColumns('board', width, sections.length);
  const layout = document.createElement('div');
  layout.className = 'board-layout';
  layout.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  layout.dataset.columns = String(columns);

  sections.forEach((section, index) => {
    const accent = getSectionAccent(index);
    const shell = document.createElement('section');
    shell.className = 'board-shell';
    shell.style.setProperty('--accent-a', accent.a);
    shell.style.setProperty('--accent-b', accent.b);
    shell.style.setProperty('--accent-soft', accent.soft);

    const pin = document.createElement('span');
    pin.className = 'board-pin';

    const ribbon = document.createElement('div');
    ribbon.className = 'board-ribbon';
    const title = createEditableElement('div', 'board-title', section.name);
    title.style.fontSize = `${sizes.secFz}px`;
    ribbon.appendChild(title);

    const head = document.createElement('div');
    head.className = 'board-head';
    head.style.fontSize = `${Math.round(sizes.thFz * .82)}px`;
    head.replaceChildren(
      createTextSpan('', 'Stock'),
      createTextSpan('', 'Return'),
      createTextSpan('', 'Time')
    );

    const list = document.createElement('div');
    list.className = 'board-list';
    section.rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'board-row';

      const name = createEditableElement('div', 'board-name', row.name);
      name.style.fontSize = `${sizes.tdFz}px`;

      const returns = createEditableElement('div', 'board-return', row.returns);
      returns.style.fontSize = `${Math.round(sizes.tdFz * .84)}px`;

      const time = createEditableElement('div', 'board-time', row.duration);
      time.style.fontSize = `${Math.round(sizes.tdFz * .74)}px`;

      item.append(name, returns, time);
      list.appendChild(item);
    });

    shell.append(pin, ribbon, head, list);

    if (section.more) {
      const more = createSectionMore(section.more, Math.round(sizes.tdFz * .74));
      more.classList.add('board-more');
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
    head.replaceChildren(
      createTextSpan('', 'Stock'),
      createTextSpan('', 'Return'),
      createTextSpan('', 'Time')
    );

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

    const header = document.createElement('div');
    header.className = 'pillar-header';

    const cap = document.createElement('div');
    cap.className = 'pillar-cap';
    const title = createEditableElement('div', 'pillar-title', section.name);
    title.style.fontSize = `${sizes.secFz}px`;
    cap.appendChild(title);

    const caption = createEditableElement('div', 'pillar-caption', 'Trade highlights');
    caption.style.fontSize = `${Math.round(sizes.tdFz * .76)}px`;
    header.append(cap, caption);

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

    shell.append(header, list);

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

function readAppStateSnapshot() {
  const getValue = id => {
    const element = document.getElementById(id);
    return element ? element.value : '';
  };
  const formatState = window.globalFormatState || {
    primary: { b: true, i: false, u: false },
    secondary: { b: false, i: false, u: false },
    tertiary: { b: true, i: false, u: false }
  };

  return {
    inputText: getValue('inputText'),
    sebiReg: sanitizeDisplayText(getValue('sebiReg')),
    disclaimer: getValue('disclaimer'),
    fileName: getValue('fileName'),
    exportFormat: getValue('exportFormat'),
    cardFormat: getValue('cardFormat'),
    cardWidth: getValue('cardWidth'),
    overallScale: getValue('overallScale'),
    headingScale: getValue('headingScale'),
    tableSpacing: getValue('tableSpacing'),
    tableBorder: getValue('tableBorder'),
    fontFamily: getValue('fontFamily'),
    activeTheme: getActiveTheme(),
    activePreset: getSelectedTemplate(),
    colorPrimary: getValue('colorPrimary'),
    colorSecondary: getValue('colorSecondary'),
    colorTertiary: getValue('colorTertiary'),
    hexPrimary: getValue('hexPrimary'),
    hexSecondary: getValue('hexSecondary'),
    hexTertiary: getValue('hexTertiary'),
    globalFormat: JSON.parse(JSON.stringify(formatState)),
    customLogoData,
    customLogoPos,
    backgroundId: typeof window.getBackgroundSelection === 'function' ? window.getBackgroundSelection() : null,
    watermarkEnabled: !!document.getElementById('watermarkToggle')?.checked,
    watermarkText: getValue('watermarkText'),
    footerText: getValue('footerText')
  };
}

function persistAppStateSnapshot() {
  clearTimeout(appStateSaveTimeout);
  appStateSaveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(readAppStateSnapshot()));
    } catch (_error) {
      setAppNotice('Draft autosave is unavailable in this browser session.', 'error');
    }
  }, 120);
}

function recordHistorySnapshot(force = false) {
  if (appStateHydrating) return;
  const snapshot = JSON.stringify(readAppStateSnapshot());
  const current = appHistory[appHistoryIndex];
  if (!force && current === snapshot) return;

  if (appHistoryIndex < appHistory.length - 1) {
    appHistory = appHistory.slice(0, appHistoryIndex + 1);
  }
  appHistory.push(snapshot);
  if (appHistory.length > APP_HISTORY_LIMIT) {
    appHistory.shift();
  } else {
    appHistoryIndex += 1;
  }
  if (appHistory.length > APP_HISTORY_LIMIT) appHistoryIndex = appHistory.length - 1;
  syncHistoryButtons();
  try {
    localStorage.setItem(APP_HISTORY_KEY, JSON.stringify({
      entries: appHistory,
      index: appHistoryIndex
    }));
  } catch (_error) {
    // Undo/redo still works in-session if storage is unavailable.
  }
}

function loadPersistedHistory() {
  try {
    const raw = localStorage.getItem(APP_HISTORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries) || !parsed.entries.length) return null;
    return {
      entries: parsed.entries.slice(-APP_HISTORY_LIMIT),
      index: Math.max(0, Math.min(Number(parsed.index) || parsed.entries.length - 1, parsed.entries.length - 1))
    };
  } catch (_error) {
    return null;
  }
}

function canUndoState() {
  return appHistoryIndex > 0;
}

function canRedoState() {
  return appHistoryIndex >= 0 && appHistoryIndex < appHistory.length - 1;
}

function syncHistoryButtons() {
  const undoButton = document.getElementById('undoButton');
  const redoButton = document.getElementById('redoButton');
  if (undoButton) undoButton.disabled = !canUndoState();
  if (redoButton) redoButton.disabled = !canRedoState();
}

function undoState() {
  if (!canUndoState() || typeof window.applyAppStateSnapshot !== 'function') return;
  appHistoryIndex -= 1;
  window.applyAppStateSnapshot(JSON.parse(appHistory[appHistoryIndex]), { fromHistory: true });
}

function redoState() {
  if (!canRedoState() || typeof window.applyAppStateSnapshot !== 'function') return;
  appHistoryIndex += 1;
  window.applyAppStateSnapshot(JSON.parse(appHistory[appHistoryIndex]), { fromHistory: true });
}

function generate() {
  clearTimeout(generateTimeout);
  generateTimeout = setTimeout(() => {
    cancelAnimationFrame(generateFrame);
    generateFrame = requestAnimationFrame(() => {
      const runId = ++generateSerial;
      latestGeneratePromise = (async () => {
        try {
          await doGenerate(runId);
          if (runId !== generateSerial) return;
          persistAppStateSnapshot();
          recordHistorySnapshot();
        } catch (error) {
          if (runId !== generateSerial) return;
          setAppNotice(`Something went wrong while rendering the preview: ${sanitizeDisplayText(error?.message || 'Unknown error')}`, 'error');
        }
      })();
    });
  }, 36);
}

async function doGenerate(runId) {
  const parser = getParserApi();
  const inputText = document.getElementById('inputText').value;
  const useAsyncParse = typeof parser.parseInputModelAsync === 'function' && inputText.split(/\r?\n/).length > 180;
  const parseModel = useAsyncParse ? await parser.parseInputModelAsync(inputText, { chunkSize: 180 }) : parser.parseInputModel(inputText);
  if (runId !== generateSerial) return;
  const sections = parseModel.sections;
  const template = getSelectedTemplate();
  const theme = getActiveTheme();
  const width = parseInt(document.getElementById('cardWidth').value, 10);
  const userScale = parseInt(document.getElementById('overallScale').value, 10) / 100;
  const headingScale = parseInt(document.getElementById('headingScale').value, 10) / 100;
  const tableSpacing = parseInt(document.getElementById('tableSpacing').value, 10) / 100;
  const format = document.getElementById('cardFormat').value;
  const totalRows = parseModel.parsedRows;
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
  const watermarkBlock = document.getElementById('watermarkDisplay');
  const footerBlock = document.getElementById('footerNoteDisplay');
  const container = document.getElementById('tablesContainer');
  const fragment = document.createDocumentFragment();
  const titleParts = getDisplayTitleParts(parseModel);

  lastParseModel = parseModel;
  updateSmartParseUI(parseModel);

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

  sebiLine.textContent = `SEBI Reg. : ${sanitizeDisplayText(document.getElementById('sebiReg').value)}`;
  sebiLine.style.fontSize = `${sizes.sebiFz}px`;
  sebiLine.style.marginBottom = `${sizes.sebiMb}px`;
  makeEditable(sebiLine);

  titleBlock.style.marginBottom = `${Math.max(2, Math.round(sizes.titleMb * 0.72))}px`;
  titleBlock.replaceChildren(
    (() => {
      const span = createTextSpan('t-green title-count', titleParts.count);
      span.style.fontSize = `${Math.round(sizes.titleFz * 1.28)}px`;
      return span;
    })(),
    (() => {
      const span = createTextSpan('t-green title-lead', titleParts.leadWord);
      span.style.fontSize = `${Math.round(sizes.titleFz * 0.9)}px`;
      return span;
    })(),
    (() => {
      const span = createTextSpan('t-white title-main', titleParts.main);
      span.style.fontSize = `${sizes.titleFz}px`;
      return span;
    })()
  );
  titleBlock.classList.toggle('is-compact', String(titleParts.main).length > 18 || String(titleParts.count).length > 2);
  makeEditable(titleBlock);

  disclaimerBlock.textContent = sanitizeDisplayText(document.getElementById('disclaimer').value, { multiline: true });
  disclaimerBlock.style.fontSize = `${sizes.discFz}px`;
  disclaimerBlock.style.marginTop = `${sizes.discMt}px`;
  makeEditable(disclaimerBlock);

  const watermarkEnabled = document.getElementById('watermarkToggle')?.checked;
  const watermarkText = sanitizeDisplayText(document.getElementById('watermarkText')?.value || '');
  const footerText = sanitizeDisplayText(document.getElementById('footerText')?.value || '', { multiline: true });
  if (watermarkBlock) {
    watermarkBlock.textContent = watermarkEnabled && watermarkText ? watermarkText : '';
    watermarkBlock.classList.toggle('is-hidden', !(watermarkEnabled && watermarkText));
  }
  if (footerBlock) {
    footerBlock.textContent = footerText;
    footerBlock.classList.toggle('is-hidden', !footerText);
  }

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
  else if (template === 'board') renderBoardSections(fragment, sections, sizes, width);
  else if (template === 'stacked') renderStackedSections(fragment, sections, sizes, width, tableSpacing);
  else if (template === 'tagged') renderTaggedSections(fragment, sections, sizes, width, tableSpacing);
  else if (template === 'ribbon') renderRibbonSections(fragment, sections, sizes, width);
  else if (template === 'glass') renderGlassSections(fragment, sections, sizes, width);
  else if (template === 'pillars') renderPillarSections(fragment, sections, sizes, width);
  else if (template === 'ledger') renderLedgerSections(fragment, sections, sizes, tableSpacing, horizontalPad);
  else if (template === 'mono') renderMonoSections(fragment, sections, sizes, width);
  else renderClassicSections(fragment, sections, sizes, tableSpacing, horizontalPad);

  container.appendChild(fragment);

  requestAnimationFrame(syncPreviewAreaLayout);
  setExportStatus('Ready to export');
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
  window.globalFormatState = globalFormat;

  function setActivePreset(template) {
    const safeTemplate = ACTIVE_TEMPLATES.includes(template) ? template : 'classic';
    document.querySelectorAll('.preset-btn').forEach(button => button.classList.toggle('active', button.getAttribute('data-template') === safeTemplate));
    localStorage.setItem('designPreset', safeTemplate);
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
    window.globalFormatState = globalFormat;
    localStorage.setItem('globalFormat', JSON.stringify(globalFormat));
  }

  function applyAppStateSnapshot(state, options = {}) {
    if (!state || typeof state !== 'object') return;
    appStateHydrating = true;

    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element && value !== undefined && value !== null) element.value = value;
    };

    try {
      if (state.activeTheme) {
        setThemeButtons(state.activeTheme);
        applyThemePalette(state.activeTheme);
      }
      if (state.activePreset) setActivePreset(state.activePreset);

      setValue('inputText', sanitizeDisplayText(state.inputText || '', { multiline: true }));
      setValue('sebiReg', sanitizeDisplayText(state.sebiReg || ''));
      setValue('disclaimer', state.disclaimer || '');
      setValue('fileName', sanitizeDisplayText(state.fileName || ''));
      setValue('exportFormat', state.exportFormat || 'jpg');
      setValue('cardFormat', state.cardFormat || 'auto');
      setValue('cardWidth', state.cardWidth || '600');
      setValue('overallScale', state.overallScale || '100');
      setValue('headingScale', state.headingScale || '90');
      setValue('tableSpacing', state.tableSpacing || '100');
      setValue('tableBorder', state.tableBorder || '1');
      setValue('fontFamily', state.fontFamily || "'Segoe UI', system-ui, sans-serif");
      setValue('watermarkText', sanitizeDisplayText(state.watermarkText || 'DRAFT'));
      setValue('footerText', state.footerText || '');

      if (state.colorPrimary) primaryColor.value = state.colorPrimary;
      if (state.colorSecondary) secondaryColor.value = state.colorSecondary;
      if (state.colorTertiary) tertiaryColor.value = state.colorTertiary;
      if (state.hexPrimary) primaryHex.value = state.hexPrimary;
      if (state.hexSecondary) secondaryHex.value = state.hexSecondary;
      if (state.hexTertiary) tertiaryHex.value = state.hexTertiary;

      updateColors(primaryColor);
      updateColors(secondaryColor);
      updateColors(tertiaryColor);

      if (state.globalFormat) {
        Object.keys(globalFormat).forEach(category => {
          if (state.globalFormat[category]) {
            Object.assign(globalFormat[category], state.globalFormat[category]);
          }
        });
      }
      syncFormats();

      if (state.customLogoData !== undefined) {
        customLogoData = state.customLogoData || null;
        removeLogoBtn.style.display = customLogoData ? 'inline-flex' : 'none';
      }
      if (state.customLogoPos) {
        customLogoPos = state.customLogoPos;
        setValue('logoPos', customLogoPos);
      }
      if (state.watermarkEnabled !== undefined) {
        const toggle = document.getElementById('watermarkToggle');
        if (toggle) toggle.checked = !!state.watermarkEnabled;
      }

      const card = document.getElementById('card');
      if (card) card.style.setProperty('--table-bw', `${document.getElementById('tableBorder').value}px`);
      if (state.backgroundId && typeof window.setBackgroundSelection === 'function') {
        window.setBackgroundSelection(state.backgroundId);
      }

      document.getElementById('cardWidthVal').textContent = `${document.getElementById('cardWidth').value}px`;
      document.getElementById('overallScaleVal').textContent = `${document.getElementById('overallScale').value}%`;
      document.getElementById('headingScaleVal').textContent = `${document.getElementById('headingScale').value}%`;
      document.getElementById('tableSpacingVal').textContent = `${document.getElementById('tableSpacing').value}%`;
      document.getElementById('tableBorderVal').textContent = `${document.getElementById('tableBorder').value}px`;

      if (!options.silent) generate();
      setAppNotice('Draft restored', 'success');
    } finally {
      appStateHydrating = false;
      if (!options.fromHistory) {
        appHistory = [];
        appHistoryIndex = -1;
      }
    }
  }

  window.applyAppStateSnapshot = applyAppStateSnapshot;

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

  const persistedHistory = loadPersistedHistory();
  if (persistedHistory) {
    try {
      appHistory = persistedHistory.entries.slice();
      appHistoryIndex = Math.max(0, Math.min(persistedHistory.index, appHistory.length - 1));
      applyAppStateSnapshot(JSON.parse(appHistory[appHistoryIndex]), { silent: true, fromHistory: true });
    } catch (_error) {
      setAppNotice('Saved history could not be restored cleanly.', 'error');
      appHistory = [];
      appHistoryIndex = -1;
    }
  }

  const savedState = localStorage.getItem(APP_STATE_KEY);
  if (!persistedHistory && savedState) {
    try {
      applyAppStateSnapshot(JSON.parse(savedState), { silent: true });
    } catch (_error) {
      setAppNotice('Saved draft could not be restored cleanly.', 'error');
    }
  }

  document.querySelectorAll('.preset-btn').forEach(button => {
    button.addEventListener('click', () => {
      setActivePreset(button.getAttribute('data-template'));
      generate();
    });
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

  document.getElementById('resetTokenColors').addEventListener('click', () => {
    applyThemePalette(getActiveTheme());
    generate();
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
    generate();
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
      const raw = String(event.target.result || '').trim();
      if (!raw) {
        setAppNotice('CSV file was empty.', 'error');
        return;
      }

      const lines = raw.split(/\r?\n/).filter(Boolean);
      const detectDelimiter = line => {
        const candidates = [',', ';', '\t', '|'];
        return candidates.sort((a, b) => (line.split(b).length - 1) - (line.split(a).length - 1))[0];
      };
      const delimiter = detectDelimiter(lines[0] || ',');
      const headerCells = (lines[0] || '').split(delimiter).map(cell => sanitizeDisplayText(cell).toLowerCase());
      const hasHeaders = headerCells.some(cell => /(category|section|stock|name|profit|return|duration|time)/i.test(cell));
      const columnIndex = keyPatterns => headerCells.findIndex(cell => keyPatterns.some(pattern => pattern.test(cell)));

      const categoryIndex = hasHeaders ? columnIndex([/(category|section|type)/i]) : 0;
      const stockIndex = hasHeaders ? columnIndex([/(stock|name|script|symbol)/i]) : 1;
      const profitIndex = hasHeaders ? columnIndex([/(profit|return|returns|gain|amount|lot)/i]) : 2;
      const durationIndex = hasHeaders ? columnIndex([/(duration|time|period|holding)/i]) : 3;
      const startIndex = hasHeaders ? 1 : 0;
      let output = '';
      let currentCategory = '';
      let validRows = 0;

      lines.slice(startIndex).forEach(line => {
        const parts = line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, ''));
        if (parts.length < 3) return;
        const category = sanitizeDisplayText(parts[categoryIndex >= 0 ? categoryIndex : 0] || '').toUpperCase();
        const stock = sanitizeDisplayText(parts[stockIndex >= 0 ? stockIndex : 1] || '');
        const profit = sanitizeDisplayText(parts[profitIndex >= 0 ? profitIndex : 2] || '');
        const duration = sanitizeDisplayText(parts[durationIndex >= 0 ? durationIndex : 3] || '');
        if (!category || !stock || !profit || !duration) return;
        if (/^(category|section|stock|name|profit|return|returns|duration|time)$/i.test(category) || /^(category|section|stock|name|profit|return|returns|duration|time)$/i.test(stock)) return;
        if (category !== currentCategory) {
          if (currentCategory) output += '\n';
          output += `${category}:\n`;
          currentCategory = category;
        }
        output += `${stock}: ${profit} in ${duration}\n`;
        validRows += 1;
      });

      if (!validRows) {
        setAppNotice('CSV did not contain recognizable trade rows.', 'error');
        return;
      }

      document.getElementById('inputText').value = output.trim();
      setAppNotice(`Imported ${validRows} CSV row${validRows === 1 ? '' : 's'}.`, 'success');
      generate();
    };
    reader.readAsText(file);
    this.value = '';
  });

  ['fontFamily', 'sebiReg'].forEach(id => document.getElementById(id).addEventListener('change', generate));
  document.getElementById('inputText').addEventListener('input', generate);
  document.getElementById('disclaimer').addEventListener('input', generate);
  document.getElementById('normalizeInput').addEventListener('click', () => {
    if (!lastParseModel || !lastParseModel.normalizedText) return;
    const parser = getParserApi();
    if (parser.learnCorrections) parser.learnCorrections((lastParseModel.reviewItems || []).filter(item => item.suggestion));
    document.getElementById('inputText').value = lastParseModel.normalizedText;
    generate();
  });
  document.getElementById('parseReviewToggle').addEventListener('click', () => {
    if (!lastParseModel?.reviewItems?.length) return;
    parseReviewExpanded = !parseReviewExpanded;
    syncParseReviewUI(lastParseModel.reviewItems.length);
  });
  document.getElementById('applyAllSuggestions').addEventListener('click', () => {
    applyAllReviewSuggestions();
  });
  document.getElementById('parseReviewList').addEventListener('click', event => {
    const button = event.target.closest('.apply-suggestion-btn');
    if (!button) return;
    applyReviewSuggestion(Number(button.getAttribute('data-review-index')));
  });

  const undoButton = document.getElementById('undoButton');
  const redoButton = document.getElementById('redoButton');
  const exportStateButton = document.getElementById('exportStateButton');
  const importStateButton = document.getElementById('importStateButton');
  const stateImportInput = document.getElementById('stateImportInput');

  undoButton.addEventListener('click', undoState);
  redoButton.addEventListener('click', redoState);

  exportStateButton.addEventListener('click', () => {
    const snapshot = readAppStateSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlobFile(blob, `${sanitizeDisplayText(snapshot.fileName || 'profit_report_config') || 'profit_report_config'}.json`);
    setAppNotice('Config exported successfully.', 'success');
  });

  importStateButton.addEventListener('click', () => stateImportInput.click());
  stateImportInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || typeof imported !== 'object') throw new Error('Invalid config');
        window.applyAppStateSnapshot(imported);
        setAppNotice('Config imported successfully.', 'success');
      } catch (_error) {
        setAppNotice('Imported config file was invalid.', 'error');
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  document.getElementById('watermarkToggle').addEventListener('change', generate);
  document.getElementById('watermarkText').addEventListener('input', generate);
  document.getElementById('footerText').addEventListener('input', generate);

  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`tab-${button.getAttribute('data-tab')}`).classList.add('active');
    });
  });

  document.addEventListener('keydown', event => {
    const editingTarget = event.target?.closest?.('textarea, input, [contenteditable="true"]');
    if (editingTarget) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      undoState();
    } else if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
      event.preventDefault();
      redoState();
    }
  });

  window.addEventListener('error', event => {
    const message = event?.error?.message || event?.message || 'An unexpected error occurred.';
    setAppNotice(`Error: ${sanitizeDisplayText(message)}`, 'error');
  });

  window.addEventListener('unhandledrejection', event => {
    const message = event?.reason?.message || event?.reason || 'A promise failed unexpectedly.';
    setAppNotice(`Error: ${sanitizeDisplayText(message)}`, 'error');
  });

  let previewResizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(previewResizeRaf);
    previewResizeRaf = requestAnimationFrame(syncPreviewAreaLayout);
  }, { passive: true });

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
  appStateHydrating = false;
  syncHistoryButtons();
  setExportStatus('Ready to export');
  generate();
});
