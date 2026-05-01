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
      ${wrapper.outerHTML}
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
  const { svg } = await buildCardSvgMarkup(card, 1);
  triggerSvgDownload(svg, fileName);
  return 1;
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
