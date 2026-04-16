(function (root, factory) {
  const api = factory(root || globalThis);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.smartParser = api.createSmartParser({
    storage: root.localStorage || null,
    fetchImpl: typeof root.fetch === 'function' ? root.fetch.bind(root) : null
  });
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const SECTION_ORDER = { EQUITY: 0, OPTIONS: 1, FUTURES: 2, COMMODITY: 3 };
  const LEARNING_STORAGE_KEY = 'smart_parser_learning_v1';
  const AI_STORAGE_KEY = 'smart_parser_ai_v1';
  const DEFAULT_AI_CONFIG = {
    enabled: false,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini',
    apiKey: '',
    autoRun: true
  };

  const DEFAULT_SECTION_ALIASES = {
    EQUITY: 'EQUITY',
    EQUITIES: 'EQUITY',
    EQUITYCALLS: 'EQUITY',
    CASH: 'EQUITY',
    CASHCALLS: 'EQUITY',
    STOCK: 'EQUITY',
    STOCKS: 'EQUITY',
    DELIVERY: 'EQUITY',
    SWING: 'EQUITY',
    EQ: 'EQUITY',
    OPTIONS: 'OPTIONS',
    OPTION: 'OPTIONS',
    OPTIONCALLS: 'OPTIONS',
    OPT: 'OPTIONS',
    PUTS: 'OPTIONS',
    CALLS: 'OPTIONS',
    DERIVATIVES: 'OPTIONS',
    FUTURES: 'FUTURES',
    FUTURE: 'FUTURES',
    FUT: 'FUTURES',
    FUTURECALLS: 'FUTURES',
    PERLOT: 'FUTURES',
    LOT: 'FUTURES',
    COMMODITY: 'COMMODITY',
    COMMODITIES: 'COMMODITY',
    COMM: 'COMMODITY',
    MCX: 'COMMODITY',
    BULLION: 'COMMODITY',
    ENERGY: 'COMMODITY'
  };

  const OPTION_KEYWORDS = /\b(CE|PE|CALL|PUT|STRADDLE|STRANGLE|OPTION|OPTIONS|BANKNIFTY|NIFTY|SENSEX|FINNIFTY)\b/i;
  const FUTURES_KEYWORDS = /\b(FUT|FUTURE|FUTURES|PER LOT|LOT)\b/i;
  const COMMODITY_KEYWORDS = /\b(MCX|CRUDE|NATURAL GAS|GOLD|SILVER|COPPER|ZINC|ALUMINIUM|ALUMINUM|LEAD|NICKEL|COTTON)\b/i;
  const EQUITY_KEYWORDS = /\b(EQUITY|CASH|DELIVERY|SWING|STOCK)\b/i;

  function createMemoryStorage() {
    const store = new Map();
    return {
      getItem(key) {
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        store.set(key, String(value));
      },
      removeItem(key) {
        store.delete(key);
      }
    };
  }

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function cleanInputLine(rawLine) {
    return String(rawLine || '')
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/(?:\u2022|\u25CF|\u25AA|\u25E6|\u2023|â€¢|â—|â–ª|â—¦|â€£)/g, '*')
      .replace(/(?:\u20B9|â‚¹)/g, 'Rs ')
      .replace(/(?:\u2010|\u2011|\u2012|\u2013|\u2014|â€|â€‘|â€’|â€“|â€”)/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function titleCaseLoose(value) {
    return normalizeWhitespace(value)
      .toLowerCase()
      .replace(/\b([a-z])/g, match => match.toUpperCase())
      .replace(/\bMins\b/g, 'Mins')
      .replace(/\bMin\b/g, 'Min')
      .replace(/\bHrs\b/g, 'Hrs')
      .replace(/\bHr\b/g, 'Hr');
  }

  function scoreToLabel(score) {
    if (score >= 0.82) return 'high';
    if (score >= 0.56) return 'medium';
    return 'low';
  }

  function normalizeSectionToken(rawName) {
    return normalizeWhitespace(rawName).replace(/[^A-Za-z]/g, '').toUpperCase();
  }

  function buildAliasMap(learning) {
    return { ...DEFAULT_SECTION_ALIASES, ...(learning.sectionAliases || {}) };
  }

  function resolveSectionAlias(rawName, learning) {
    const token = normalizeSectionToken(rawName);
    const aliasMap = buildAliasMap(learning);
    if (aliasMap[token]) return aliasMap[token];
    if (token.startsWith('COMMOD')) return 'COMMODITY';
    return null;
  }

  function normalizeTradeName(name) {
    return normalizeWhitespace(name)
      .replace(/^[#*+\-.()\d\s]+/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function normalizeDuration(duration) {
    let normalized = normalizeWhitespace(duration)
      .replace(/^(?:in|on)\s+/i, '')
      .replace(/^(?:just|only|the)\s+/i, '')
      .replace(/^(?:the\s+)?same day$/i, 'Same Day');

    normalized = titleCaseLoose(normalized)
      .split(/\s+/)
      .map(word => {
        const lower = word.toLowerCase();
        if (lower === 'minutes' || lower === 'minute' || lower === 'mins') return 'Mins';
        if (lower === 'hours' || lower === 'hour') return 'Hour';
        if (lower === 'days' || lower === 'day') return lower === 'days' ? 'Days' : 'Day';
        return word;
      })
      .join(' ');

    return normalized || 'Review';
  }

  function normalizePercent(value) {
    const normalized = normalizeWhitespace(value).replace(/\bpercent\b/ig, '%');
    if (normalized.includes('%')) return normalized;
    return `${normalized}%`;
  }

  function normalizeCurrency(value) {
    const sign = normalizeWhitespace(value).startsWith('-') ? '-' : '';
    const normalized = normalizeWhitespace(value)
      .replace(/^[-+]\s*/, '')
      .replace(/(?:\u20B9|â‚¹)/g, '')
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

  function isCurrencyReturn(value, sectionName) {
    return /futures/i.test(sectionName || '') || /(?:\u20B9|â‚¹|rs\.?|inr|\/-|\bper\s*lot\b)/i.test(value || '');
  }

  function normalizeParsedReturn(value, sectionName) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) return 'Review';
    return isCurrencyReturn(normalized, sectionName) ? normalizeCurrency(normalized) : normalizePercent(normalized);
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
    const explicit = line.match(/^(.+?)(?:\s*[:\-]\s*)(.+)$/);
    if (explicit) {
      return { name: explicit[1].trim(), returns: explicit[2].trim() };
    }

    const loose = line.match(/^(.*?)([-+]?(?:Rs\.?|INR|\u20B9)?\s*\d[\d,]*(?:\.\d+)?(?:\s*\/-\s*)?(?:\s*PER LOT)?|[-+]?\d+(?:\.\d+)?%)$/i);
    if (loose) {
      return { name: loose[1].trim(), returns: loose[2].trim() };
    }

    return null;
  }

  function looksLikeReturn(value) {
    return /(?:%|\u20B9|â‚¹|rs\.?|inr|\/-|\bper\s*lot\b|\d)/i.test(value || '');
  }

  function looksLikeDuration(value) {
    return /\b(min|mins|minute|minutes|hour|hours|hr|hrs|day|days|week|weeks|month|months|same day)\b/i.test(value || '');
  }

  function inferSectionFromContent(payload) {
    if (payload.hintedSection) {
      return { section: payload.hintedSection, score: payload.explicitSection ? 0.97 : 0.88, reason: payload.explicitSection ? 'explicit-section' : 'alias-section' };
    }

    const sourceText = [payload.rawLine, payload.name, payload.returns].filter(Boolean).join(' ');
    if (isCurrencyReturn(payload.returns, '') || FUTURES_KEYWORDS.test(sourceText)) return { section: 'FUTURES', score: 0.9, reason: 'currency-return' };
    if (COMMODITY_KEYWORDS.test(sourceText)) return { section: 'COMMODITY', score: 0.84, reason: 'commodity-keyword' };
    if (OPTION_KEYWORDS.test(sourceText)) return { section: 'OPTIONS', score: 0.8, reason: 'option-keyword' };
    if (EQUITY_KEYWORDS.test(sourceText)) return { section: 'EQUITY', score: 0.76, reason: 'equity-keyword' };
    return { section: 'EQUITY', score: 0.64, reason: 'default-percent' };
  }

  function detectSectionHeader(line, learning) {
    const cleaned = line.replace(/\*/g, '').trim();
    const match = cleaned.match(/^([A-Za-z/& ]+?)\s*(?:\(\s*(\d+)\s*\))?\s*:?\s*$/);
    if (!match) return null;
    if (cleaned.length > 34 && !/\(\s*\d+\s*\)/.test(cleaned) && !cleaned.endsWith(':')) return null;

    const canonical = resolveSectionAlias(match[1], learning);
    if (!canonical) return null;
    return {
      raw: cleaned,
      alias: match[1].trim(),
      canonical,
      expectedCount: match[2] ? parseInt(match[2], 10) : null,
      explicit: normalizeSectionToken(match[1]) === canonical
    };
  }

  function parseCompleteRow(line, context) {
    const cleaned = line.replace(/^[*+\-]+\s*/, '').trim();
    const durationParts = splitDurationSegment(cleaned);
    if (!durationParts) return null;

    const nameReturn = splitNameAndReturn(durationParts.left);
    if (!nameReturn) return null;

    const name = normalizeTradeName(nameReturn.name);
    if (!name) return null;

    const sectionResult = inferSectionFromContent({
      rawLine: line,
      name,
      returns: nameReturn.returns,
      hintedSection: context.sectionHint,
      explicitSection: context.explicitSection
    });

    return {
      kind: 'row',
      row: {
        name,
        returns: normalizeParsedReturn(nameReturn.returns, sectionResult.section),
        duration: normalizeDuration(durationParts.duration),
        confidenceScore: sectionResult.score,
        confidenceLabel: scoreToLabel(sectionResult.score),
        inferredSection: !context.sectionHint,
        parseReason: sectionResult.reason
      },
      sectionName: sectionResult.section,
      confidenceScore: sectionResult.score,
      confidenceLabel: scoreToLabel(sectionResult.score),
      normalizedLine: `${name} - ${normalizeParsedReturn(nameReturn.returns, sectionResult.section)} in ${normalizeDuration(durationParts.duration)}`,
      reason: sectionResult.reason
    };
  }

  function parsePartialRow(line, context) {
    const cleaned = line.replace(/^[*+\-]+\s*/, '').trim();
    const explicit = cleaned.match(/^(.+?)(?:\s*[:\-]\s*)(.+)$/);
    if (!explicit) return null;

    const name = normalizeTradeName(explicit[1]);
    const remainder = normalizeWhitespace(explicit[2]);
    if (!name || !remainder) return null;

    if (looksLikeDuration(remainder) && !/(?:%|\u20B9|â‚¹|rs\.?|inr|\/-|\bper\s*lot\b)/i.test(remainder)) {
      const sectionResult = inferSectionFromContent({
        rawLine: line,
        name,
        returns: '',
        hintedSection: context.sectionHint,
        explicitSection: context.explicitSection
      });
      const row = {
        name,
        returns: 'Review',
        duration: normalizeDuration(remainder),
        confidenceScore: 0.34,
        confidenceLabel: 'low',
        inferredSection: !context.sectionHint,
        parseReason: 'missing-return',
        missingFields: ['returns']
      };
      return {
        kind: 'partial',
        row,
        sectionName: sectionResult.section,
        confidenceScore: 0.34,
        confidenceLabel: 'low',
        reason: 'missing-return',
        normalizedLine: `${name} - Review in ${row.duration}`,
        suggestion: `${name} - Review in ${row.duration}`
      };
    }

    if (looksLikeReturn(remainder) && !looksLikeDuration(remainder)) {
      const sectionResult = inferSectionFromContent({
        rawLine: line,
        name,
        returns: remainder,
        hintedSection: context.sectionHint,
        explicitSection: context.explicitSection
      });
      const row = {
        name,
        returns: normalizeParsedReturn(remainder, sectionResult.section),
        duration: 'Review',
        confidenceScore: 0.38,
        confidenceLabel: 'low',
        inferredSection: !context.sectionHint,
        parseReason: 'missing-duration',
        missingFields: ['duration']
      };
      return {
        kind: 'partial',
        row,
        sectionName: sectionResult.section,
        confidenceScore: 0.38,
        confidenceLabel: 'low',
        reason: 'missing-duration',
        normalizedLine: `${name} - ${row.returns} in Review`,
        suggestion: `${name} - ${row.returns} in Review`
      };
    }

    return null;
  }

  function buildSuggestion(line, reason) {
    if (reason === 'header-alias') return `${line.replace(/\*+/g, '').trim()}:`;
    const cleaned = cleanInputLine(line).replace(/^[*+\-]+\s*/, '').trim();
    if (cleaned && !/[::\-]/.test(cleaned) && /\d/.test(cleaned)) {
      const durationParts = splitDurationSegment(cleaned);
      if (durationParts) {
        const tailMatch = durationParts.left.match(/^(.*?)([-+]?(?:Rs\.?|INR|\u20B9)?\s*\d[\d,]*(?:\.\d+)?(?:\s*\/-\s*)?(?:\s*PER LOT)?|[-+]?\d+(?:\.\d+)?%)$/i);
        if (tailMatch) {
          const name = normalizeTradeName(tailMatch[1]);
          const returns = tailMatch[2];
          if (name) return `${name} - ${normalizeParsedReturn(returns, '')} in ${normalizeDuration(durationParts.duration)}`;
        }
      }
    }
    return '';
  }

  function extractTitleMeta(line) {
    const compact = line.replace(/^[*#\s]+|[*#\s]+$/g, '').trim();
    if (!compact || !/(profit|trade|pick|booked|till now|today|weekly|monthly|report)/i.test(compact)) return null;

    const parts = compact.split(/\s*[-|]\s*/).filter(Boolean);
    let dateLabel = '';
    let titleLine = compact;

    if (parts.length > 1) {
      const titleIndex = parts.findIndex(part => /(profit|trade|pick|booked|till now|today|weekly|monthly|report)/i.test(part));
      if (titleIndex !== -1) {
        titleLine = parts[titleIndex];
        const prefix = parts.slice(0, titleIndex).join(' ').trim();
        if (prefix && /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|\d{1,2}(?:st|nd|rd|th)?)\b/i.test(prefix)) {
          dateLabel = titleCaseLoose(prefix);
        }
      }
    }

    const totalMatch = titleLine.match(/(\d+)\s+(.*)$/);
    const body = titleCaseLoose((totalMatch ? totalMatch[2] : titleLine).trim());
    let reportMode = 'daily';
    if (/weekly/i.test(body)) reportMode = 'weekly';
    else if (/monthly/i.test(body)) reportMode = 'monthly';
    else if (/till now/i.test(body)) reportMode = 'till-now';
    else if (/today/i.test(body)) reportMode = 'today';

    return {
      rawLine: compact,
      dateLabel,
      totalHint: totalMatch ? parseInt(totalMatch[1], 10) : null,
      titleBody: body,
      reportMode
    };
  }

  function buildMetaFromPreamble(lines) {
    const meta = {
      dateLabel: '',
      totalHint: null,
      titleBody: '',
      rawTitle: '',
      reportMode: 'daily',
      extraLines: []
    };

    lines.forEach(line => {
      const titleMeta = extractTitleMeta(line);
      const currentScore = (meta.totalHint ? 3 : 0) + (/(today|till now|booked|profits|trades)/i.test(meta.titleBody) ? 2 : 0) + (meta.dateLabel ? 1 : 0);
      const nextScore = titleMeta
        ? (titleMeta.totalHint ? 3 : 0) + (/(today|till now|booked|profits|trades)/i.test(titleMeta.titleBody) ? 2 : 0) + (titleMeta.dateLabel ? 1 : 0)
        : 0;

      if (titleMeta && (!meta.rawTitle || nextScore >= currentScore)) {
        if (meta.rawTitle && meta.rawTitle !== titleMeta.rawLine) meta.extraLines.push(titleCaseLoose(meta.rawTitle));
        meta.dateLabel = titleMeta.dateLabel;
        meta.totalHint = titleMeta.totalHint;
        meta.titleBody = titleMeta.titleBody;
        meta.rawTitle = titleMeta.rawLine;
        meta.reportMode = titleMeta.reportMode;
      } else {
        meta.extraLines.push(titleCaseLoose(line));
      }
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

  function buildLineStats(analyses) {
    return analyses.reduce((stats, item) => {
      const label = item.confidenceLabel || 'low';
      stats[label] = (stats[label] || 0) + 1;
      return stats;
    }, { high: 0, medium: 0, low: 0 });
  }

  function extractResponseText(payload) {
    if (!payload) return '';
    if (typeof payload.output_text === 'string') return payload.output_text;
    if (Array.isArray(payload.choices) && payload.choices[0]?.message?.content) return payload.choices[0].message.content;
    if (Array.isArray(payload.output)) {
      return payload.output
        .flatMap(item => item.content || [])
        .map(item => item.text || '')
        .join('\n');
    }
    return '';
  }

  function extractJsonBlock(text) {
    const trimmed = normalizeWhitespace(text);
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      const fence = trimmed.match(/```json\s*([\s\S]+?)```/i);
      if (fence) {
        try {
          return JSON.parse(fence[1].trim());
        } catch (_err) {}
      }
      const start = trimmed.indexOf('{');
      const end = trimmed.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(trimmed.slice(start, end + 1));
        } catch (_err) {}
      }
    }
    return null;
  }

  function sanitizeAiRow(row, fallbackSection) {
    const sectionName = row.section || fallbackSection;
    return {
      name: normalizeTradeName(row.name || ''),
      returns: normalizeParsedReturn(row.returns || row.return || 'Review', sectionName),
      duration: normalizeDuration(row.duration || 'Review'),
      confidenceScore: 0.88,
      confidenceLabel: 'high',
      inferredSection: true,
      parseReason: 'ai-fallback'
    };
  }

  function modelFromAiJson(json) {
    if (!json || !Array.isArray(json.sections)) return null;
    const sections = json.sections
      .map(section => ({
        name: resolveSectionAlias(section.name || section.section || '', { sectionAliases: {}, exactCorrections: {} }) || 'EQUITY',
        rows: Array.isArray(section.rows) ? section.rows.map(row => sanitizeAiRow(row, section.name || section.section || 'EQUITY')).filter(row => row.name) : []
      }))
      .filter(section => section.rows.length);

    if (!sections.length) return null;

    const meta = {
      dateLabel: titleCaseLoose(json.meta?.dateLabel || json.meta?.date || ''),
      totalHint: Number.isFinite(json.meta?.totalHint) ? json.meta.totalHint : null,
      titleBody: titleCaseLoose(json.meta?.titleBody || json.meta?.title || ''),
      rawTitle: titleCaseLoose(json.meta?.rawTitle || json.meta?.title || ''),
      reportMode: json.meta?.reportMode || 'daily',
      extraLines: []
    };

    const sortedSections = sections.sort((a, b) => (SECTION_ORDER[a.name] ?? 99) - (SECTION_ORDER[b.name] ?? 99));
    const parsedRows = sortedSections.reduce((sum, section) => sum + section.rows.length, 0);
    const normalizedText = buildNormalizedText(meta, sortedSections);
    const lineAnalyses = sortedSections.flatMap(section => section.rows.map(row => ({
      rawLine: `${row.name} - ${row.returns} in ${row.duration}`,
      normalizedLine: `${row.name} - ${row.returns} in ${row.duration}`,
      kind: 'row',
      confidenceScore: row.confidenceScore,
      confidenceLabel: row.confidenceLabel,
      sectionName: section.name,
      reason: 'ai-fallback'
    })));

    return {
      meta,
      sections: sortedSections,
      unmatchedLines: [],
      reviewItems: [],
      lineAnalyses,
      lineStats: buildLineStats(lineAnalyses),
      parsedRows,
      confidence: 0.9,
      confidenceLabel: 'high',
      normalizedText,
      source: 'ai'
    };
  }

  function createSmartParser(options = {}) {
    const storage = options.storage || createMemoryStorage();
    const fetchImpl = options.fetchImpl || null;

    function loadLearning() {
      return safeJsonParse(storage.getItem(LEARNING_STORAGE_KEY), {
        exactCorrections: {},
        sectionAliases: {}
      });
    }

    function saveLearning(state) {
      storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(state));
    }

    function getAiConfig() {
      return { ...DEFAULT_AI_CONFIG, ...safeJsonParse(storage.getItem(AI_STORAGE_KEY), {}) };
    }

    function setAiConfig(nextConfig) {
      const merged = { ...DEFAULT_AI_CONFIG, ...nextConfig };
      storage.setItem(AI_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }

    function learnCorrection(rawLine, correctedLine) {
      const learning = loadLearning();
      const rawKey = cleanInputLine(rawLine);
      const corrected = cleanInputLine(correctedLine);
      if (!rawKey || !corrected) return learning;

      learning.exactCorrections[rawKey] = corrected;

      const header = detectSectionHeader(corrected, learning);
      if (header) {
        learning.sectionAliases[normalizeSectionToken(rawLine)] = header.canonical;
      }

      saveLearning(learning);
      return learning;
    }

    function learnCorrections(items) {
      items.forEach(item => {
        if (item?.rawLine && item?.suggestion) learnCorrection(item.rawLine, item.suggestion);
      });
    }

    function parseInputModel(text) {
      const learning = loadLearning();
      const sectionsMap = new Map();
      const preambleLines = [];
      const lineAnalyses = [];
      const reviewItems = [];
      const unmatchedLines = [];
      let currentSection = null;
      let currentHeaderExplicit = false;

      function ensureSection(name) {
        if (!sectionsMap.has(name)) sectionsMap.set(name, { name, rows: [] });
        return sectionsMap.get(name);
      }

      text.split('\n').forEach(rawLine => {
        const cleaned = cleanInputLine(rawLine);
        if (!cleaned) return;

        const learnedCorrection = learning.exactCorrections[cleaned];
        const effectiveLine = learnedCorrection || cleaned;
        const header = detectSectionHeader(effectiveLine.replace(/\*/g, '').trim(), learning);

        if (header) {
          currentSection = header.canonical;
          currentHeaderExplicit = header.explicit;
          const section = ensureSection(header.canonical);
          if (header.expectedCount) section.expectedCount = header.expectedCount;
          lineAnalyses.push({
            rawLine,
            normalizedLine: `${titleCaseLoose(header.canonical)}:`,
            kind: 'header',
            confidenceScore: header.explicit ? 0.98 : 0.9,
            confidenceLabel: header.explicit ? 'high' : 'high',
            sectionName: header.canonical,
            reason: header.explicit ? 'explicit-header' : 'alias-header'
          });
          return;
        }

        if (!currentSection) {
          const titleMeta = extractTitleMeta(effectiveLine);
          if (titleMeta) {
            preambleLines.push(effectiveLine);
            lineAnalyses.push({
              rawLine,
              normalizedLine: effectiveLine,
              kind: 'title',
              confidenceScore: 0.9,
              confidenceLabel: 'high',
              reason: 'title-meta'
            });
            return;
          }
        }

        const context = {
          sectionHint: currentSection,
          explicitSection: currentHeaderExplicit
        };

        const moreMatch = effectiveLine.replace(/\*/g, '').trim().match(/^[+&]\s*(\d+)\s+more/i);
        if (moreMatch && currentSection) {
          ensureSection(currentSection).more = `+${moreMatch[1]} more`;
          lineAnalyses.push({
            rawLine,
            normalizedLine: `+${moreMatch[1]} more`,
            kind: 'meta',
            confidenceScore: 0.88,
            confidenceLabel: 'high',
            sectionName: currentSection,
            reason: 'more-indicator'
          });
          return;
        }

        const fullRow = parseCompleteRow(effectiveLine.replace(/\*/g, '').trim(), context);
        if (fullRow) {
          ensureSection(fullRow.sectionName).rows.push(fullRow.row);
          const normalizedCandidate = cleanInputLine(rawLine).replace(/^[*+\-]+\s*/, '').trim();
          const analysis = {
            rawLine,
            normalizedLine: fullRow.normalizedLine,
            kind: fullRow.kind,
            confidenceScore: learnedCorrection ? 0.99 : fullRow.confidenceScore,
            confidenceLabel: learnedCorrection ? 'high' : fullRow.confidenceLabel,
            sectionName: fullRow.sectionName,
            reason: learnedCorrection ? 'learned-correction' : fullRow.reason,
            rawEffectiveLine: effectiveLine
          };
          lineAnalyses.push(analysis);
          if (analysis.confidenceLabel !== 'high') {
            reviewItems.push({
              type: 'review',
              rawLine,
              sectionName: fullRow.sectionName,
              suggestion: fullRow.normalizedLine,
              confidenceLabel: analysis.confidenceLabel,
              confidenceScore: analysis.confidenceScore,
              reason: analysis.reason
            });
          } else if (!learnedCorrection && normalizedCandidate && normalizedCandidate !== fullRow.normalizedLine) {
            reviewItems.push({
              type: 'format',
              rawLine,
              sectionName: fullRow.sectionName,
              suggestion: fullRow.normalizedLine,
              confidenceLabel: 'high',
              confidenceScore: analysis.confidenceScore,
              reason: 'format-normalization'
            });
          }
          return;
        }

        const partialRow = parsePartialRow(effectiveLine.replace(/\*/g, '').trim(), context);
        if (partialRow) {
          ensureSection(partialRow.sectionName).rows.push(partialRow.row);
          lineAnalyses.push({
            rawLine,
            normalizedLine: partialRow.normalizedLine,
            kind: partialRow.kind,
            confidenceScore: partialRow.confidenceScore,
            confidenceLabel: partialRow.confidenceLabel,
            sectionName: partialRow.sectionName,
            reason: partialRow.reason
          });
          reviewItems.push({
            type: 'partial',
            rawLine,
            sectionName: partialRow.sectionName,
            suggestion: partialRow.suggestion,
            confidenceLabel: partialRow.confidenceLabel,
            confidenceScore: partialRow.confidenceScore,
            reason: partialRow.reason
          });
          return;
        }

        const suggestion = buildSuggestion(effectiveLine, 'unmatched');
        const analysis = {
          rawLine,
          normalizedLine: suggestion || '',
          kind: 'unmatched',
          confidenceScore: 0.14,
          confidenceLabel: 'low',
          sectionName: currentSection || '',
          reason: 'unmatched-line'
        };
        lineAnalyses.push(analysis);
        unmatchedLines.push(rawLine);
        reviewItems.push({
          type: 'unmatched',
          rawLine,
          sectionName: currentSection || '',
          suggestion,
          confidenceLabel: 'low',
          confidenceScore: 0.14,
          reason: 'unmatched-line'
        });
        if (!currentSection) preambleLines.push(effectiveLine);
      });

      const sections = Array.from(sectionsMap.values())
        .filter(section => section.rows.length)
        .sort((a, b) => (SECTION_ORDER[a.name] ?? 99) - (SECTION_ORDER[b.name] ?? 99));

      const meta = buildMetaFromPreamble(preambleLines);
      const parsedRows = sections.reduce((sum, section) => sum + section.rows.length, 0);
      const dataAnalyses = lineAnalyses.filter(item => !['title', 'meta', 'header'].includes(item.kind));
      const confidence = dataAnalyses.length
        ? dataAnalyses.reduce((sum, item) => sum + item.confidenceScore, 0) / dataAnalyses.length
        : 0;
      const normalizedText = buildNormalizedText(meta, sections);

      return {
        meta,
        sections,
        unmatchedLines,
        reviewItems,
        lineAnalyses,
        lineStats: buildLineStats(dataAnalyses),
        parsedRows,
        confidence,
        confidenceLabel: scoreToLabel(confidence),
        normalizedText,
        source: 'deterministic'
      };
    }

    async function tryAiFallback(text, currentModel) {
      const config = getAiConfig();
      if (!config.enabled || !config.endpoint || !config.model || !config.apiKey) {
        return { status: 'disabled', reason: 'AI assist is not configured yet.' };
      }

      if (!fetchImpl) {
        return { status: 'disabled', reason: 'No fetch implementation available in this environment.' };
      }

      const payload = {
        model: config.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You normalize messy trading report text into strict JSON. Return only valid JSON with shape {"meta":{"dateLabel":"","totalHint":0,"titleBody":"","reportMode":"daily"},"sections":[{"name":"EQUITY","rows":[{"name":"","returns":"","duration":""}]}]}. Use only EQUITY, OPTIONS, FUTURES, COMMODITY section names.'
          },
          {
            role: 'user',
            content: text
          }
        ]
      };

      try {
        const response = await fetchImpl(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let detail = '';
          try {
            detail = extractResponseText(await response.json()) || '';
          } catch (jsonError) {
            try {
              detail = await response.text();
            } catch (textError) {
              detail = '';
            }
          }

          if (response.status === 404 && /127\.0\.0\.1|localhost/i.test(config.endpoint)) {
            return { status: 'error', reason: `Local AI server responded with 404. Start Ollama and confirm the OpenAI-compatible endpoint is available at ${config.endpoint}.` };
          }

          if (response.status === 400 && /model/i.test(detail) && /not found|pull|unknown/i.test(detail)) {
            return { status: 'error', reason: `Model ${config.model} is not available yet. Run \`ollama pull ${config.model}\` and try again.` };
          }

          return { status: 'error', reason: detail ? `AI request failed with ${response.status}: ${detail}` : `AI request failed with ${response.status}.` };
        }

        const json = await response.json();
        const parsedJson = extractJsonBlock(extractResponseText(json));
        const aiModel = modelFromAiJson(parsedJson);
        if (!aiModel) {
          return { status: 'error', reason: 'AI response could not be validated.' };
        }

        if (currentModel && aiModel.parsedRows < currentModel.parsedRows) {
          return { status: 'ignored', reason: 'AI result was weaker than deterministic parsing.' };
        }

        return { status: 'success', model: aiModel };
      } catch (error) {
        const message = error?.message || 'AI request failed.';
        if (/Failed to fetch|NetworkError|fetch/i.test(message) && /127\.0\.0\.1|localhost/i.test(config.endpoint)) {
          return {
            status: 'error',
            reason: `Could not reach local AI server at ${config.endpoint}. Install/start Ollama, run \`ollama pull ${config.model}\`, then keep Ollama running.`
          };
        }
        return { status: 'error', reason: message };
      }
    }

    return {
      parseInputModel,
      parseInput(text) {
        return parseInputModel(text).sections;
      },
      learnCorrection,
      learnCorrections,
      getLearning: loadLearning,
      clearLearning() {
        saveLearning({ exactCorrections: {}, sectionAliases: {} });
      },
      getAiConfig,
      setAiConfig,
      tryAiFallback
    };
  }

  return {
    createSmartParser,
    DEFAULT_AI_CONFIG,
    createMemoryStorage
  };
});
