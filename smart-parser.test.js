const assert = require('assert');
const { createSmartParser, createMemoryStorage } = require('./smart-parser.js');

function makeParser(extra = {}) {
  return createSmartParser({
    storage: createMemoryStorage(),
    ...extra
  });
}

async function run() {
  {
    const parser = makeParser();
    const model = parser.parseInputModel(`*16TH APRIL - 11 PROFITS TILL NOW*

*EQUITIES*(4)
* JMFINANCIL -  3.01% IN 6 DAYS
* HEG - 4.16% IN 1 DAY
* CROMPTON - 2.05% IN 1 DAY
* CESC - 3.65% IN 2 DAYS

*OPTIONS (3)*
* PAYTM- 2.98% in 1 day
* CROMPTON- 11.02% in just 26 mins
* PAYTM - 3.40% in just 46 mins

*FUTURES (4)*
* NATIONALUM - 15750/- PER LOT in 1 day
* MAXHELTH - 6405/- PER LOT in 1 day
* BDL- 5915/- PER LOT in 1 day
* NATIONALUM - 7500/- PER LOT in just 27 mins`);
    assert.equal(model.parsedRows, 11);
    assert.equal(model.sections[0].name, 'EQUITY');
    assert.equal(model.sections[1].name, 'OPTIONS');
    assert.equal(model.sections[2].name, 'FUTURES');
    assert.equal(model.meta.dateLabel, '16th April');
    assert.equal(model.meta.titleBody, 'Profits Till Now');
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`JMFINANCIL - 3.01% in 6 days
HEG - 4.16% in 1 day
PAYTM CE - 11.02% in 26 mins
NATIONALUM - Rs 15750 per lot in 1 day`);
    assert.equal(model.parsedRows, 4);
    assert.equal(model.sections.find(section => section.name === 'EQUITY').rows.length, 2);
    assert.equal(model.sections.find(section => section.name === 'OPTIONS').rows.length, 1);
    assert.equal(model.sections.find(section => section.name === 'FUTURES').rows.length, 1);
    assert.ok(model.lineStats.medium >= 1);
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`Cash Calls:
RELIANCE - 2.4% in 3 days

MCX:
CRUDEOIL - 1.8% in 1 day`);
    assert.equal(model.sections[0].name, 'EQUITY');
    assert.equal(model.sections[1].name, 'COMMODITY');
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`Equity:
RELIANCE - 2.4%
INFY - 3 Days`);
    assert.equal(model.parsedRows, 2);
    assert.equal(model.reviewItems.length, 2);
    assert.equal(model.sections[0].rows[0].duration, 'Review');
    assert.equal(model.sections[0].rows[1].returns, 'Review');
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`Equity:
TCS 2.2% in 4 days`);
    assert.equal(model.reviewItems.length, 1);
    assert.ok(model.reviewItems[0].suggestion.includes('TCS - 2.2% in 4 Days'));
  }

  {
    const parser = makeParser();
    parser.learnCorrection('TCS 2.2% in 4 days', 'TCS - 2.2% in 4 days');
    const model = parser.parseInputModel(`Equity:
TCS 2.2% in 4 days`);
    assert.equal(model.reviewItems.length, 0);
    assert.equal(model.sections[0].rows[0].name, 'TCS');
    assert.ok(model.lineStats.high >= 1);
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`Monthly report
April performance note
11 Profits Booked Today

Equity:
RELIANCE - 2.4% in 3 days`);
    assert.equal(model.meta.titleBody, 'Profits Booked Today');
    assert.equal(model.meta.reportMode, 'today');
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`Equity:
RELIANCE - 2.4% in 3 days
weird unsupported line`);
    assert.equal(model.unmatchedLines.length, 1);
    const unmatched = model.reviewItems.find(item => item.type === 'unmatched');
    assert.equal(unmatched.confidenceLabel, 'low');
  }

  {
    const fetchImpl = async () => ({
      ok: true,
      async json() {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  meta: { titleBody: 'Profits Booked Today', totalHint: 2, reportMode: 'today' },
                  sections: [
                    { name: 'Equity', rows: [{ name: 'RELIANCE', returns: '2.4%', duration: '3 days' }] },
                    { name: 'Futures', rows: [{ name: 'NATIONALUM', returns: '15750', duration: '1 day' }] }
                  ]
                })
              }
            }
          ]
        };
      }
    });
    const parser = makeParser({ fetchImpl });
    parser.setAiConfig({
      enabled: true,
      endpoint: 'https://example.com/v1/chat/completions',
      model: 'test-model',
      apiKey: 'secret',
      autoRun: true
    });
    const result = await parser.tryAiFallback('messy text', parser.parseInputModel('bad line'));
    assert.equal(result.status, 'success');
    assert.equal(result.model.parsedRows, 2);
    assert.equal(result.model.sections[1].name, 'FUTURES');
  }

  {
    const parser = makeParser();
    const model = parser.parseInputModel(`Equity:
INFY - 2.1% in 2 days

Options:
NIFTY CE - 10.4% in 25 mins`);
    assert.equal(model.lineStats.high, 2);
    assert.equal(model.lineStats.medium, 0);
    assert.equal(model.lineStats.low, 0);
  }

  console.log('smart-parser tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
