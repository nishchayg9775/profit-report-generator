function getExportFileName() {
  let customName = document.getElementById('fileName').value.trim();
  if (customName) return sanitizeFileStem(customName);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const date = new Date();
  return sanitizeFileStem(`Univest_Profit_Report_${date.getDate()}_${months[date.getMonth()]}`);
}

function sanitizeFileStem(fileName) {
  return String(fileName || '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '') || 'Univest_Profit_Report';
}

function getExportFormat() {
  const select = document.getElementById('exportFormat');
  const format = (select?.value || 'jpg').toLowerCase();
  return ['jpg', 'png', 'svg'].includes(format) ? format : 'jpg';
}

function getExportUiElements() {
  return {
    status: document.getElementById('exportStatus'),
    generateButton: document.getElementById('generateButton'),
    downloadButton: document.getElementById('downloadButton'),
    formatSelect: document.getElementById('exportFormat'),
    fileName: document.getElementById('fileName')
  };
}

function setExportStatus(message, state = 'idle') {
  const { status } = getExportUiElements();
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-busy', state === 'busy');
  status.classList.toggle('is-error', state === 'error');
}

function setExportButtonsDisabled(disabled) {
  const { generateButton, downloadButton, formatSelect, fileName } = getExportUiElements();
  if (generateButton) generateButton.disabled = disabled;
  if (downloadButton) downloadButton.disabled = disabled;
  if (formatSelect) formatSelect.disabled = disabled;
  if (fileName) fileName.disabled = disabled;
}

function downloadBlobFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.download = fileName;
  anchor.href = url;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function triggerSvgDownload(svgText, fileName) {
  downloadBlobFile(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }), `${fileName}.svg`);
}

function waitForImages(root) {
  const images = Array.from(root.querySelectorAll('img'));
  return Promise.all(images.map(image => {
    if (image.complete) return Promise.resolve();
    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));
}

function copyComputedStyles(source, target) {
  const computed = window.getComputedStyle(source);
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed[index];
    target.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
  }
}

function inlineCloneStyles(source, target) {
  copyComputedStyles(source, target);
  target.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  for (let index = 0; index < sourceChildren.length; index += 1) {
    inlineCloneStyles(sourceChildren[index], targetChildren[index]);
  }
}

function normalizeXhtmlFragment(markup) {
  return String(markup || '')
    .replace(/<(br|hr|img|input|meta|link|col|source|track|area|base|embed|param)([^>]*)>/gi, (full, tagName, attrs = '') => {
      if (/\/>$/.test(full)) return full;
      return `<${tagName}${attrs} />`;
    });
}

function createSvgElement(tagName, attrs = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      element.setAttribute(key, String(value));
    }
  });
  return element;
}

function sanitizeSvgId(value, fallback = 'Layer') {
  const normalized = String(value || '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function createNamedSvgGroup(name, fallback = 'Layer') {
  const safeName = String(name || fallback).trim() || fallback;
  return createSvgElement('g', {
    id: sanitizeSvgId(safeName, fallback),
    'data-name': safeName
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function resolveSvgAssetHref(url) {
  const source = String(url || '').trim().replace(/^['"]|['"]$/g, '');
  if (!source) return '';
  if (/^data:/i.test(source)) return source;
  try {
    const response = await fetch(source);
    if (!response.ok) return source;
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch (_error) {
    return source;
  }
}

function splitCssLayers(value) {
  const layers = [];
  let current = '';
  let depth = 0;
  for (const char of String(value || '')) {
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    if (char === ',' && depth === 0) {
      if (current.trim()) layers.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) layers.push(current.trim());
  return layers;
}

function normalizeGradientAngle(direction) {
  const value = String(direction || '').trim().toLowerCase();
  if (!value) return 180;
  if (/^-?\d+(\.\d+)?deg$/.test(value)) return Number.parseFloat(value);
  if (value === 'to right') return 90;
  if (value === 'to left') return 270;
  if (value === 'to top') return 0;
  if (value === 'to bottom') return 180;
  if (value === 'to top right' || value === 'to right top') return 45;
  if (value === 'to bottom right' || value === 'to right bottom') return 135;
  if (value === 'to bottom left' || value === 'to left bottom') return 225;
  if (value === 'to top left' || value === 'to left top') return 315;
  return 180;
}

function parseGradientStop(part) {
  const value = String(part || '').trim();
  if (!value) return null;
  const match = value.match(/^(.*?)(?:\s+([0-9.]+%))?$/);
  if (!match) return { color: value, offset: null };
  return {
    color: String(match[1] || '').trim(),
    offset: match[2] || null
  };
}

function parseLinearGradientLayer(layer) {
  const match = String(layer || '').trim().match(/^linear-gradient\((.*)\)$/i);
  if (!match) return null;
  const parts = splitCssLayers(match[1]);
  if (!parts.length) return null;
  let angle = 180;
  if (/^-?\d+(\.\d+)?deg$/i.test(parts[0]) || /^to\b/i.test(parts[0])) {
    angle = normalizeGradientAngle(parts.shift());
  }
  const stops = parts.map(parseGradientStop).filter(Boolean);
  if (!stops.length) return null;
  const missingOffsets = stops.every(stop => !stop.offset);
  if (missingOffsets && stops.length > 1) {
    stops.forEach((stop, index) => {
      stop.offset = `${(index / (stops.length - 1)) * 100}%`;
    });
  }
  return { angle, stops };
}

function ensureSvgDefs(svg) {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = createSvgElement('defs');
    svg.insertBefore(defs, svg.firstChild);
  }
  return defs;
}

function registerLinearGradient(defs, gradientSpec) {
  const ownerSvg = defs.ownerSVGElement;
  ownerSvg.__svgGradientIndex = (ownerSvg.__svgGradientIndex || 0) + 1;
  const gradientId = `svgGradient_${ownerSvg.__svgGradientIndex}`;
  const gradient = createSvgElement('linearGradient', { id: gradientId });
  const rad = ((gradientSpec.angle - 90) * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  gradient.setAttribute('x1', `${50 - dx * 50}%`);
  gradient.setAttribute('y1', `${50 - dy * 50}%`);
  gradient.setAttribute('x2', `${50 + dx * 50}%`);
  gradient.setAttribute('y2', `${50 + dy * 50}%`);
  gradientSpec.stops.forEach(stop => {
    gradient.appendChild(createSvgElement('stop', {
      offset: stop.offset || undefined,
      'stop-color': stop.color
    }));
  });
  defs.appendChild(gradient);
  return `url(#${gradientId})`;
}

function appendStyledRect(target, rect, style, defs, options = {}) {
  const radius = Number.parseFloat(options.radius || '0');
  const borderColor = options.borderColor || style.borderColor || 'transparent';
  const borderWidth = Number.parseFloat(options.borderWidth || style.borderTopWidth || '0');
  const hasBorder = borderWidth > 0 && !isTransparentColor(borderColor);
  const backgroundColor = style.backgroundColor || 'transparent';
  const backgroundImage = style.backgroundImage || 'none';
  const backgroundLayers = splitCssLayers(backgroundImage).filter(layer => layer && layer !== 'none');
  const shapeGroup = createSvgElement('g');
  let hasVisual = false;

  if (!isTransparentColor(backgroundColor)) {
    hasVisual = true;
    shapeGroup.appendChild(createSvgElement('rect', {
      x: rect.x.toFixed(2),
      y: rect.y.toFixed(2),
      width: rect.width.toFixed(2),
      height: rect.height.toFixed(2),
      rx: radius ? radius.toFixed(2) : undefined,
      ry: radius ? radius.toFixed(2) : undefined,
      fill: backgroundColor
    }));
  }

  backgroundLayers.forEach(layer => {
    const parsed = parseLinearGradientLayer(layer);
    if (!parsed) return;
    hasVisual = true;
    shapeGroup.appendChild(createSvgElement('rect', {
      x: rect.x.toFixed(2),
      y: rect.y.toFixed(2),
      width: rect.width.toFixed(2),
      height: rect.height.toFixed(2),
      rx: radius ? radius.toFixed(2) : undefined,
      ry: radius ? radius.toFixed(2) : undefined,
      fill: registerLinearGradient(defs, parsed)
    }));
  });

  if (hasBorder) {
    hasVisual = true;
    shapeGroup.appendChild(createSvgElement('rect', {
      x: rect.x.toFixed(2),
      y: rect.y.toFixed(2),
      width: rect.width.toFixed(2),
      height: rect.height.toFixed(2),
      rx: radius ? radius.toFixed(2) : undefined,
      ry: radius ? radius.toFixed(2) : undefined,
      fill: 'none',
      stroke: borderColor,
      'stroke-width': borderWidth.toFixed(2)
    }));
  }

  if (!hasVisual) return null;
  target.appendChild(shapeGroup);
  return shapeGroup;
}

function getRectRelativeTo(rect, origin) {
  return {
    x: rect.left - origin.left,
    y: rect.top - origin.top,
    width: rect.width,
    height: rect.height
  };
}

function getCanvasTextContext() {
  const canvas = document.createElement('canvas');
  return canvas.getContext('2d');
}

function wrapSvgText(text, maxWidth, font) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const ctx = getCanvasTextContext();
  if (!ctx) return [normalized];

  ctx.font = font;
  const words = normalized.split(' ');
  const lines = [];
  let current = '';

  const pushCurrent = () => {
    const value = current.trim();
    if (value) lines.push(value);
    current = '';
  };

  words.forEach(word => {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      return;
    }
    pushCurrent();
    current = word;
  });

  pushCurrent();
  return lines.length ? lines : [normalized];
}

function appendSvgTextBlock(svg, rect, text, style = {}, options = {}) {
  const {
    anchor = 'start',
    valign = 'middle',
    lineHeight = 1.22,
    wrap = false,
    width = rect.width,
    baselineShift = 0,
    scale = 1
  } = options;

  const fontSize = Number.parseFloat(style.fontSize || 16) * scale;
  const fontFamily = style.fontFamily || 'sans-serif';
  const fontWeight = style.fontWeight || '400';
  const fontStyle = style.fontStyle || 'normal';
  const fill = style.fill || '#fff';
  const textDecoration = style.textDecoration || 'none';
  const textTransform = style.textTransform || 'none';
  const textAlign = style.textAlign || anchor;
  const textContent = textTransform === 'uppercase' ? String(text || '').toUpperCase() : String(text || '');
  const lines = wrap ? wrapSvgText(textContent, width, `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`) : textContent.split(/\r?\n/);
  const pad = 8 * scale;
  const x = rect.x + (textAlign === 'end' ? rect.width - pad : textAlign === 'center' ? rect.width / 2 : pad);
  const startY = rect.y + rect.height / 2 + baselineShift - ((lines.length - 1) * fontSize * lineHeight) / 2;

  const group = createSvgElement('text', {
    x: x.toFixed(2),
    y: startY.toFixed(2),
    fill,
    'font-size': fontSize,
    'font-family': fontFamily,
    'font-weight': fontWeight,
    'font-style': fontStyle,
    'text-anchor': textAlign === 'end' ? 'end' : textAlign === 'center' ? 'middle' : 'start',
    'dominant-baseline': valign === 'middle' ? 'middle' : 'alphabetic',
    'xml:space': 'preserve',
    'text-decoration': textDecoration
  });

  lines.forEach((line, index) => {
    const tspan = createSvgElement('tspan', {
      x: x.toFixed(2),
      dy: index === 0 ? 0 : (fontSize * lineHeight).toFixed(2)
    });
    tspan.textContent = line;
    group.appendChild(tspan);
  });

  svg.appendChild(group);
  return group;
}

function appendSvgTable(svg, table, cardRect, fontFamily, defs) {
  const tableScale = Math.max(0.1, Number(table.dataset.svgScale || 1));
  const tableRect = table.getBoundingClientRect();
  const relativeTable = getRectRelativeTo(tableRect, cardRect);
  const tableStyle = window.getComputedStyle(table);
  appendStyledRect(svg, relativeTable, tableStyle, defs, {
    borderColor: tableStyle.borderColor || 'rgba(255,255,255,.16)',
    borderWidth: (1 * tableScale).toFixed(2),
    radius: Number.parseFloat(tableStyle.borderTopLeftRadius || '0') * tableScale
  });

  const headerCells = Array.from(table.querySelectorAll('thead th'));
  const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
  const allRows = [
    ...headerCells.length ? [headerCells] : [],
    ...bodyRows.map(row => Array.from(row.children))
  ];

  allRows.forEach((cells, rowIndex) => {
    cells.forEach((cell, colIndex) => {
      const cellRect = cell.getBoundingClientRect();
      const relativeCell = getRectRelativeTo(cellRect, cardRect);
      const cellStyle = window.getComputedStyle(cell);
      appendStyledRect(svg, relativeCell, cellStyle, defs, {
        borderColor: cellStyle.borderColor || tableStyle.borderColor || 'rgba(255,255,255,.16)',
        borderWidth: (1 * tableScale).toFixed(2),
        radius: Number.parseFloat(cellStyle.borderTopLeftRadius || '0') * tableScale
      });

      const textStyle = {
        fontSize: cellStyle.fontSize,
        fontFamily: cellStyle.fontFamily || fontFamily,
        fontWeight: cellStyle.fontWeight,
        fontStyle: cellStyle.fontStyle,
        fill: cellStyle.color,
        textDecoration: cellStyle.textDecorationLine,
        textTransform: cellStyle.textTransform,
        textAlign: cellStyle.textAlign
      };
      const isHeader = cell.tagName === 'TH';
      const textValue = cell.textContent || '';
      appendSvgTextBlock(svg, relativeCell, textValue, textStyle, {
        anchor: isHeader ? 'center' : (cell.classList.contains('td-name') ? 'start' : cell.classList.contains('td-duration') ? 'end' : 'center'),
        valign: 'middle',
        wrap: false,
        width: relativeCell.width - (16 * tableScale),
        scale: tableScale
      });
    });
  });
}

function isTransparentColor(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || normalized === 'transparent' || normalized === 'rgba(0, 0, 0, 0)' || normalized === 'rgba(0,0,0,0)';
}

function hasVisibleBorder(style) {
  return ['Top', 'Right', 'Bottom', 'Left'].some(side => {
    const width = Number.parseFloat(style[`border${side}Width`] || '0');
    const borderStyle = style[`border${side}Style`] || 'none';
    const color = style[`border${side}Color`] || '';
    return width > 0 && borderStyle !== 'none' && !isTransparentColor(color);
  });
}

function getTextAnchorForElement(element, style) {
  if (style.textAlign === 'center') return 'center';
  if (style.textAlign === 'right' || style.textAlign === 'end') return 'end';
  if (style.display.includes('flex') || style.display.includes('grid')) {
    if (style.justifyContent.includes('center')) return 'center';
    if (style.justifyContent.includes('end')) return 'end';
  }
  if (element.classList.contains('board-return') || element.classList.contains('ribbon-return') || element.classList.contains('glass-return') || element.classList.contains('mono-return')) return 'center';
  if (element.classList.contains('board-time') || element.classList.contains('ribbon-meta') || element.classList.contains('glass-meta') || element.classList.contains('pillar-meta') || element.classList.contains('mono-meta')) return 'end';
  return 'start';
}

function appendSvgElementBox(svg, element, cardRect, defs, scale = 1) {
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const relativeRect = getRectRelativeTo(rect, cardRect);
  const style = window.getComputedStyle(element);
  const radius = Number.parseFloat(style.borderTopLeftRadius || '0') * scale;
  return appendStyledRect(svg, relativeRect, style, defs, {
    borderColor: style.borderColor || 'transparent',
    borderWidth: hasVisibleBorder(style) ? Math.max(1, Number.parseFloat(style.borderTopWidth || '0') * scale).toFixed(2) : '0',
    radius
  });
}

function shouldRenderLeafText(element) {
  if (!element || !element.textContent || !element.textContent.trim()) return false;
  if (element.closest('table')) return false;
  if (element.children.length > 0) return false;
  const tagName = element.tagName;
  return !['IMG', 'BR', 'COL', 'COLGROUP', 'TBODY', 'THEAD', 'TR', 'TABLE'].includes(tagName);
}

async function appendSvgImage(svg, element, cardRect) {
  const source = element.currentSrc || element.src || element.getAttribute('src');
  if (!source) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const relativeRect = getRectRelativeTo(rect, cardRect);
  const style = window.getComputedStyle(element);
  const href = await resolveSvgAssetHref(source);
  const imageNode = createSvgElement('image', {
    href: href || source,
    x: relativeRect.x.toFixed(2),
    y: relativeRect.y.toFixed(2),
    width: relativeRect.width.toFixed(2),
    height: relativeRect.height.toFixed(2),
    opacity: style.opacity || undefined,
    preserveAspectRatio: 'xMidYMid meet'
  });
  svg.appendChild(imageNode);
  return imageNode;
}

function getSectionTitleElement(root) {
  const selectors = [
    '.card-section',
    '.spotlight-badge',
    '.board-title',
    '.ribbon-title',
    '.glass-title',
    '.pillar-title',
    '.pillar-cap',
    '.ledger-badge',
    '.mono-title'
  ].join(', ');
  if (root.matches?.(selectors)) return root;
  return root.querySelector(selectors);
}

function getSectionNameHint(root, index) {
  const label = getSectionTitleElement(root)?.textContent?.trim();
  return label || `Section ${index + 1}`;
}

function isLayoutWrapperElement(element) {
  return element.classList.contains('board-layout')
    || element.classList.contains('ribbon-layout')
    || element.classList.contains('glass-layout')
    || element.classList.contains('pillars-layout')
    || element.classList.contains('mono-layout')
    || element.classList.contains('stacked-layout');
}

function isSectionShellElement(element) {
  return element.classList.contains('spotlight-shell')
    || element.classList.contains('stacked-shell')
    || element.classList.contains('board-shell')
    || element.classList.contains('ribbon-shell')
    || element.classList.contains('glass-shell')
    || element.classList.contains('pillar-shell')
    || element.classList.contains('ledger-shell')
    || element.classList.contains('mono-shell');
}

function collectSectionRenderGroups(container) {
  const groups = [];
  let pendingClassicGroup = null;

  Array.from(container.children).forEach(child => {
    if (child.tagName === 'IMG') {
      groups.push({ name: 'Logo', roots: [child] });
      pendingClassicGroup = null;
      return;
    }

    if (isLayoutWrapperElement(child)) {
      Array.from(child.children).forEach((sectionChild, index) => {
        groups.push({
          name: getSectionNameHint(sectionChild, groups.length + index),
          roots: [sectionChild]
        });
      });
      pendingClassicGroup = null;
      return;
    }

    if (isSectionShellElement(child)) {
      groups.push({ name: getSectionNameHint(child, groups.length), roots: [child] });
      pendingClassicGroup = null;
      return;
    }

    if (child.classList.contains('card-section')) {
      pendingClassicGroup = { name: child.textContent.trim() || `Section ${groups.length + 1}`, roots: [child] };
      groups.push(pendingClassicGroup);
      return;
    }

    if (child.tagName === 'TABLE' || child.classList.contains('section-more')) {
      if (pendingClassicGroup) {
        pendingClassicGroup.roots.push(child);
      } else {
        groups.push({ name: `Section ${groups.length + 1}`, roots: [child] });
      }
      return;
    }

    groups.push({ name: getSectionNameHint(child, groups.length), roots: [child] });
    pendingClassicGroup = null;
  });

  return groups;
}

function getRootLayerName(root, index) {
  if (root.tagName === 'TABLE') return `Table ${index + 1}`;
  if (root.tagName === 'IMG') return `Asset ${index + 1}`;
  if (root.classList.contains('section-more')) return `Overflow ${index + 1}`;
  const label = getSectionTitleElement(root)?.textContent?.trim();
  if (label) return label;
  const primaryClass = Array.from(root.classList || []).find(Boolean);
  return primaryClass ? `${primaryClass} ${index + 1}` : `Item ${index + 1}`;
}

async function renderSvgRootGroup(targetGroup, root, cardRect, fontFamily, layoutScale, defs) {
  const shapesGroup = createNamedSvgGroup(`${targetGroup.getAttribute('data-name')} Shapes`, 'Shapes');
  const tablesGroup = createNamedSvgGroup(`${targetGroup.getAttribute('data-name')} Tables`, 'Tables');
  const textGroup = createNamedSvgGroup(`${targetGroup.getAttribute('data-name')} Text`, 'Text');
  targetGroup.append(shapesGroup, tablesGroup, textGroup);

  const descendants = [root, ...Array.from(root.querySelectorAll('*'))];

  for (const element of descendants) {
    if (element.tagName === 'TABLE') continue;
    if (element.tagName === 'IMG') {
      await appendSvgImage(shapesGroup, element, cardRect);
      continue;
    }
    appendSvgElementBox(shapesGroup, element, cardRect, defs, layoutScale);
  }

  descendants.forEach(element => {
    if (element.tagName !== 'TABLE') return;
    element.dataset.svgScale = `${layoutScale}`;
    appendSvgTable(tablesGroup, element, cardRect, fontFamily, defs);
    delete element.dataset.svgScale;
  });

  descendants.forEach(element => {
    if (!shouldRenderLeafText(element)) return;
    const rect = getRectRelativeTo(element.getBoundingClientRect(), cardRect);
    const style = window.getComputedStyle(element);
    appendSvgTextBlock(textGroup, rect, element.textContent, {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily || fontFamily,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fill: style.color,
      textDecoration: style.textDecorationLine,
      textTransform: style.textTransform,
      textAlign: style.textAlign
    }, {
      anchor: getTextAnchorForElement(element, style),
      valign: 'middle',
      wrap: false,
      width: Math.max(1, rect.width - (8 * layoutScale)),
      scale: layoutScale
    });
  });
}

async function buildClassicVectorSvg(card) {
  const cardRect = card.getBoundingClientRect();
  const width = Math.ceil(cardRect.width);
  const height = Math.ceil(cardRect.height);
  const baseWidth = Math.max(1, card.offsetWidth || width);
  const layoutScale = Math.max(0.1, width / baseWidth);
  const cardStyle = window.getComputedStyle(card);
  const fontFamily = cardStyle.fontFamily || 'sans-serif';
  const themeIsLight = card.classList.contains('theme-light');
  const backgroundFill = themeIsLight ? '#f5f8fc' : '#10131a';
  const backgroundImage = cardStyle.backgroundImage || '';

  const svg = createSvgElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    'shape-rendering': 'geometricPrecision',
    'text-rendering': 'geometricPrecision'
  });
  const defs = ensureSvgDefs(svg);

  const backgroundLayer = createNamedSvgGroup('Background', 'Background');
  const headerLayer = createNamedSvgGroup('Header', 'Header');
  const sectionsLayer = createNamedSvgGroup('Sections', 'Sections');
  const footerLayer = createNamedSvgGroup('Footer', 'Footer');
  svg.append(backgroundLayer, headerLayer, sectionsLayer, footerLayer);

  appendStyledRect(backgroundLayer, { x: 0, y: 0, width, height }, cardStyle, defs, {
    borderColor: 'transparent',
    borderWidth: '0',
    radius: 0
  }) || backgroundLayer.appendChild(createSvgElement('rect', {
    x: 0,
    y: 0,
    width,
    height,
    fill: backgroundFill
  }));

  if (backgroundImage.includes('url(')) {
    const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/i);
    if (match?.[1]) {
      const href = await resolveSvgAssetHref(match[1]);
      backgroundLayer.appendChild(createSvgElement('image', {
        href: href || match[1],
        x: 0,
        y: 0,
        width,
        height,
        preserveAspectRatio: 'xMidYMid slice',
        opacity: 0.45
      }));
    }
  }

  backgroundLayer.appendChild(createSvgElement('rect', {
    x: 0,
    y: 0,
    width,
    height,
    fill: 'none',
    stroke: cardStyle.borderColor || 'rgba(255,255,255,.08)',
    'stroke-width': layoutScale
  }));

  const sebi = card.querySelector('#sebiLine');
  if (sebi) {
    const rect = getRectRelativeTo(sebi.getBoundingClientRect(), cardRect);
    appendSvgTextBlock(headerLayer, rect, sebi.textContent, {
      fontSize: window.getComputedStyle(sebi).fontSize,
      fontFamily,
      fontWeight: window.getComputedStyle(sebi).fontWeight,
      fontStyle: window.getComputedStyle(sebi).fontStyle,
      fill: window.getComputedStyle(sebi).color,
      textTransform: window.getComputedStyle(sebi).textTransform,
      textAlign: 'end'
    }, { anchor: 'end', valign: 'middle', scale: layoutScale });
  }

  const titleBlock = card.querySelector('#titleBlock');
  if (titleBlock) {
    const titleLayer = createNamedSvgGroup('Title', 'Title');
    headerLayer.appendChild(titleLayer);
    const titleChildren = Array.from(titleBlock.children);
    if (titleChildren.length) {
      titleChildren.forEach(child => {
        const rect = getRectRelativeTo(child.getBoundingClientRect(), cardRect);
        const childStyle = window.getComputedStyle(child);
        appendSvgTextBlock(titleLayer, rect, child.textContent, {
          fontSize: childStyle.fontSize,
          fontFamily: childStyle.fontFamily || fontFamily,
          fontWeight: childStyle.fontWeight,
          fontStyle: childStyle.fontStyle,
          fill: childStyle.color,
          textDecoration: childStyle.textDecorationLine,
          textTransform: childStyle.textTransform
        }, { anchor: 'start', valign: 'middle', scale: layoutScale });
      });
    } else {
      const rect = getRectRelativeTo(titleBlock.getBoundingClientRect(), cardRect);
      const titleStyle = window.getComputedStyle(titleBlock);
      appendSvgTextBlock(titleLayer, rect, titleBlock.textContent, {
        fontSize: titleStyle.fontSize,
        fontFamily: titleStyle.fontFamily || fontFamily,
        fontWeight: titleStyle.fontWeight,
        fontStyle: titleStyle.fontStyle,
        fill: titleStyle.color,
        textDecoration: titleStyle.textDecorationLine,
        textTransform: titleStyle.textTransform
      }, { anchor: 'start', valign: 'middle', scale: layoutScale });
    }
  }

  const container = card.querySelector('#tablesContainer');
  if (container) {
    const sectionGroups = collectSectionRenderGroups(container);
    for (const [index, group] of sectionGroups.entries()) {
      const sectionLayer = createNamedSvgGroup(`Section ${index + 1} ${group.name}`, `Section_${index + 1}`);
      sectionsLayer.appendChild(sectionLayer);
      for (const [rootIndex, root] of group.roots.entries()) {
        const rootLayer = createNamedSvgGroup(`${sectionLayer.getAttribute('data-name')} ${getRootLayerName(root, rootIndex)}`, `Section_${index + 1}_Item_${rootIndex + 1}`);
        sectionLayer.appendChild(rootLayer);
        await renderSvgRootGroup(rootLayer, root, cardRect, fontFamily, layoutScale, defs);
      }
    }
  }

  const disclaimer = card.querySelector('#disclaimerDisplay');
  if (disclaimer && disclaimer.textContent.trim()) {
    const rect = getRectRelativeTo(disclaimer.getBoundingClientRect(), cardRect);
    const style = window.getComputedStyle(disclaimer);
    appendSvgTextBlock(footerLayer, rect, disclaimer.textContent, {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily || fontFamily,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fill: style.color,
      textDecoration: style.textDecorationLine,
      textTransform: style.textTransform
    }, { anchor: 'middle', valign: 'middle', wrap: true, width: rect.width - (12 * layoutScale), scale: layoutScale });
  }

  const watermark = card.querySelector('#watermarkDisplay');
  if (watermark && !watermark.classList.contains('is-hidden') && watermark.textContent.trim()) {
    const rect = getRectRelativeTo(watermark.getBoundingClientRect(), cardRect);
    const style = window.getComputedStyle(watermark);
    appendSvgTextBlock(footerLayer, rect, watermark.textContent, {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily || fontFamily,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fill: style.color,
      textDecoration: style.textDecorationLine,
      textTransform: style.textTransform
    }, { anchor: 'middle', valign: 'middle', wrap: false, scale: layoutScale });
  }

  const footer = card.querySelector('#footerNoteDisplay');
  if (footer && !footer.classList.contains('is-hidden') && footer.textContent.trim()) {
    const rect = getRectRelativeTo(footer.getBoundingClientRect(), cardRect);
    const style = window.getComputedStyle(footer);
    appendSvgTextBlock(footerLayer, rect, footer.textContent, {
      fontSize: style.fontSize,
      fontFamily: style.fontFamily || fontFamily,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fill: style.color,
      textDecoration: style.textDecorationLine,
      textTransform: style.textTransform
    }, { anchor: 'middle', valign: 'middle', wrap: true, width: rect.width - (12 * layoutScale), scale: layoutScale });
  }

  return new XMLSerializer().serializeToString(svg);
}

async function buildCardSvgMarkup(card, scale = 1) {
  if (document.fonts?.ready) await document.fonts.ready;
  await waitForImages(card);

  const rect = card.getBoundingClientRect();
  const width = Math.ceil(card.offsetWidth || rect.width);
  const height = Math.ceil(card.offsetHeight || rect.height);
  const exportWidth = Math.max(1, Math.round(width * scale));
  const exportHeight = Math.max(1, Math.round(height * scale));

  const clone = card.cloneNode(true);
  inlineCloneStyles(card, clone);
  clone.style.margin = '0';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.boxSizing = 'border-box';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.style.margin = '0';
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.appendChild(clone);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${width} ${height}">
    <foreignObject width="100%" height="100%">
      ${normalizeXhtmlFragment(wrapper.outerHTML)}
    </foreignObject>
  </svg>`;

  return { svg, width, height, exportWidth, exportHeight };
}

async function renderCardCanvasWithHtml2Canvas(card, scale = 1) {
  if (typeof window.html2canvas !== 'function') return null;
  if (document.fonts?.ready) await document.fonts.ready;
  await waitForImages(card);

  const canvas = await window.html2canvas(card, {
    backgroundColor: null,
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    removeContainer: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight
  });

  if (!canvas || !canvas.width || !canvas.height) {
    throw new Error('html2canvas did not produce a usable canvas');
  }

  return canvas;
}

async function loadImageFromBlobUrl(blobUrl) {
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = error => reject(error);
    image.src = blobUrl;
  });
  return image;
}

function downloadCanvasBlob(canvas, fileName, mimeType, quality = 0.95) {
  return new Promise((resolve, reject) => {
    const finalize = blob => {
      if (blob) {
        downloadBlobFile(blob, fileName);
        resolve();
        return;
      }

      try {
        const fallbackUrl = canvas.toDataURL(mimeType, quality);
        const anchor = document.createElement('a');
        anchor.download = fileName;
        anchor.href = fallbackUrl;
        anchor.click();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    if (!canvas.toBlob) {
      finalize(null);
      return;
    }

    canvas.toBlob(finalize, mimeType, quality);
  });
}

async function exportCardAsSvg(card, fileName) {
  try {
    const svg = await buildClassicVectorSvg(card);
    triggerSvgDownload(svg, fileName);
    return 1;
  } catch (error) {
    const canvas = await renderCardCanvasWithHtml2Canvas(card, 2);
    if (!canvas) {
      throw error || new Error('SVG export requires a browser canvas renderer');
    }

    const pngDataUrl = canvas.toDataURL('image/png');
    const width = canvas.width;
    const height = canvas.height;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <image href="${pngDataUrl}" xlink:href="${pngDataUrl}" width="${width}" height="${height}" />
    </svg>`;

    triggerSvgDownload(svg, fileName);
    return 1;
  }
}

async function exportCardAsRaster(card, fileName, format) {
  const isPng = format === 'png';
  const mimeType = isPng ? 'image/png' : 'image/jpeg';
  const quality = isPng ? 1 : 0.95;
  const scale = isPng ? 2.5 : 2;
  try {
    const htmlCanvas = await renderCardCanvasWithHtml2Canvas(card, scale);
    if (htmlCanvas) {
      return await downloadCanvasSlices(htmlCanvas, fileName, mimeType, quality, isPng ? 'png' : 'jpg');
    }
  } catch (_error) {
    // Fall through to the SVG raster fallback below.
  }

  const { svg, exportWidth, exportHeight } = await buildCardSvgMarkup(card, scale);
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const source = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImageFromBlobUrl(source);
    return await downloadImageSlices(image, exportWidth, exportHeight, fileName, mimeType, quality, isPng ? 'png' : 'jpg');
  } finally {
    URL.revokeObjectURL(source);
  }
}

async function downloadImageSlices(image, exportWidth, exportHeight, fileName, mimeType, quality, extension) {
  const sliceLimit = 2400;
  const sliceCount = Math.max(1, Math.ceil(exportHeight / sliceLimit));

  for (let sliceIndex = 0; sliceIndex < sliceCount; sliceIndex += 1) {
    const sliceTop = sliceIndex * sliceLimit;
    const sliceHeight = Math.min(sliceLimit, exportHeight - sliceTop);
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = sliceHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, sliceTop, exportWidth, sliceHeight, 0, 0, exportWidth, sliceHeight);

    const suffix = sliceCount > 1 ? `_part${sliceIndex + 1}` : '';
    await downloadCanvasBlob(canvas, `${fileName}${suffix}.${extension}`, mimeType, quality);
  }
  return sliceCount;
}

async function downloadCanvasSlices(canvas, fileName, mimeType, quality, extension) {
  const exportWidth = canvas.width;
  const exportHeight = canvas.height;
  const sliceLimit = 2400;
  const sliceCount = Math.max(1, Math.ceil(exportHeight / sliceLimit));

  for (let sliceIndex = 0; sliceIndex < sliceCount; sliceIndex += 1) {
    const sliceTop = sliceIndex * sliceLimit;
    const sliceHeight = Math.min(sliceLimit, exportHeight - sliceTop);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = exportWidth;
    sliceCanvas.height = sliceHeight;
    const context = sliceCanvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(canvas, 0, sliceTop, exportWidth, sliceHeight, 0, 0, exportWidth, sliceHeight);

    const suffix = sliceCount > 1 ? `_part${sliceIndex + 1}` : '';
    await downloadCanvasBlob(sliceCanvas, `${fileName}${suffix}.${extension}`, mimeType, quality);
  }
  return sliceCount;
}

async function download() {
  const card = document.getElementById('card');
  const fileName = getExportFileName();
  const format = getExportFormat();

  setExportButtonsDisabled(true);
  setExportStatus(`Exporting ${format.toUpperCase()}...`, 'busy');

  try {
    await window.waitForStablePreview?.();
    if (format === 'svg') {
      await exportCardAsSvg(card, fileName);
      setExportStatus('SVG downloaded successfully');
      setAppNotice?.('SVG export completed successfully.', 'success');
      return;
    }

    const partCount = await exportCardAsRaster(card, fileName, format);
    setExportStatus(partCount > 1 ? `Downloaded ${partCount} export parts` : `${format.toUpperCase()} downloaded successfully`);
    setAppNotice?.(`${format.toUpperCase()} export completed successfully.`, 'success');
  } catch (_error) {
    setExportStatus('Export failed. Try again after preview finishes rendering.', 'error');
    setAppNotice?.('Export failed. Please try again after the preview finishes rendering.', 'error');
  } finally {
    setExportButtonsDisabled(false);
    setTimeout(() => setExportStatus('Ready to export'), 1200);
  }
}

async function downloadBatch() {
  const card = document.getElementById('card');
  const fileName = getExportFileName();

  setExportButtonsDisabled(true);
  setExportStatus('Exporting JPG, PNG, and SVG...', 'busy');
  setAppNotice?.('Batch export started.', 'busy');

  try {
    await window.waitForStablePreview?.();
    await exportCardAsRaster(card, fileName, 'jpg');
    await exportCardAsRaster(card, fileName, 'png');
    await exportCardAsSvg(card, fileName);
    setExportStatus('Batch export completed successfully');
    setAppNotice?.('Batch export completed successfully.', 'success');
  } catch (_error) {
    setExportStatus('Batch export failed. Try again after preview finishes rendering.', 'error');
    setAppNotice?.('Batch export failed. Please try again after the preview finishes rendering.', 'error');
  } finally {
    setExportButtonsDisabled(false);
    setTimeout(() => setExportStatus('Ready to export'), 1200);
  }
}

window.downloadBatch = downloadBatch;
