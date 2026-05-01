function getActiveTheme() {
  const active = document.querySelector('.theme-btn.active');
  return active ? active.getAttribute('data-theme') : 'dark';
}

function getSelectedTemplate() {
  const active = document.querySelector('.preset-btn.active');
  const template = active ? active.getAttribute('data-template') : 'classic';
  return ACTIVE_TEMPLATES.includes(template) ? template : 'classic';
}

function getSectionAccent(index) {
  return SECTION_ACCENTS[index % SECTION_ACCENTS.length];
}

function sanitizeDisplayText(value, { multiline = false } = {}) {
  const raw = String(value ?? '');
  const stripped = raw.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').replace(/\u00A0/g, ' ');
  if (multiline) {
    return stripped
      .split(/\r?\n/)
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n')
      .trim();
  }
  return stripped.replace(/\s+/g, ' ').trim();
}

function setAppNotice(message, state = 'idle') {
  const notice = document.getElementById('appNotice');
  if (!notice) return;
  notice.textContent = sanitizeDisplayText(message || 'Ready to export');
  notice.classList.toggle('is-busy', state === 'busy');
  notice.classList.toggle('is-error', state === 'error');
  notice.classList.toggle('is-success', state === 'success');
}

function clearAppNotice() {
  setAppNotice('Ready to export', 'idle');
}

function protectEditableContent(element) {
  if (!element) return element;

  element.addEventListener('paste', event => {
    const clipboard = event.clipboardData || window.clipboardData;
    const plainText = clipboard ? clipboard.getData('text/plain') : '';
    if (!plainText) return;
    event.preventDefault();
    document.execCommand('insertText', false, plainText);
  });

  element.addEventListener('drop', event => {
    event.preventDefault();
  });

  element.addEventListener('dragover', event => {
    event.preventDefault();
  });

  return element;
}

function makeEditable(element) {
  element.contentEditable = 'true';
  element.spellcheck = false;
  element.setAttribute('role', 'textbox');
  element.setAttribute('aria-multiline', 'true');
  return protectEditableContent(element);
}

function createEditableElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return makeEditable(element);
}

function createTextSpan(className, text) {
  const element = document.createElement('span');
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createTextBlock(className, text) {
  const element = document.createElement('div');
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createSectionMore(text, fontSize) {
  const more = createEditableElement('div', 'section-more', text);
  more.style.fontSize = `${fontSize}px`;
  return more;
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
    ? `${parseModel.parsedRows} trade rows detected across ${sectionCount} section${sectionCount === 1 ? '' : 's'}${breakdownParts.length ? ` (${breakdownParts.join(', ')})` : ''}`
    : 'No trade rows detected yet';

  if (parseModel.meta.rawTitle || parseModel.meta.dateLabel) {
    const titleLine = parseModel.meta.titleBody ? `${parseModel.uniqueRows || parseModel.tradeSummary?.uniqueRows || parseModel.parsedRows || parseModel.meta.totalHint || ''} ${parseModel.meta.titleBody}`.trim() : parseModel.meta.rawTitle;
    detail.textContent = parseModel.meta.dateLabel
      ? `Detected heading: ${titleLine} | Date: ${parseModel.meta.dateLabel}`
      : `Detected heading: ${titleLine}`;
  } else if (issueCount) {
    detail.textContent = `${issueCount} line${issueCount === 1 ? '' : 's'} could not be mapped cleanly. ${breakdownParts.length ? `Breakdown: ${breakdownParts.join(', ')}.` : 'Review them below.'}`;
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
    parseInput,
    learnCorrections() {}
  };
}

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
