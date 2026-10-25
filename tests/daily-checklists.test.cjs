const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function app() {
  const elements = new Map();
  const context = vm.createContext({
    Intl, Date, JSON, setTimeout: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { querySelector: (selector) => {
      if (!elements.has(selector)) elements.set(selector, {
        value: selector === '#pin' ? '1234' : 'Testperson', style: {},
        toDataURL: () => 'data:image/png;base64,test', close: () => {},
      });
      return elements.get(selector);
    } },
  });
  for (const file of [
    'js/data.js', 'js/core/utils.js', 'js/core/state.js', 'js/core/ui-state.js',
    'js/daily/checklists/ask21b.js', 'js/daily/checklists.js',
    'js/daily/status.js', 'js/daily/daily-check.js', 'js/daily/issues.js',
feature/kontrollprotokolle-anzeigen
    'js/daily/signature.js', 'js/daily/protocols.js',
=======
    'js/daily/signature.js', 'js/daily/issue-lifecycle.js',
 main
  ]) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  vm.runInContext('function closeDialog() {}', context);
  return { run: (code) => vm.runInContext(code, context), elements };
}

test('ASK 21 B uses 26 original items in three groups; LS4a retains 24', () => {
  const { run } = app();
  assert.equal(run('JSON.stringify(ASK21B_DAILY.map(g => g.items.length))'), '[15,7,4]');
  assert.equal(run('dailyCheckCount(0)'), 26);
  assert.equal(run('dailyCheckCount(3)'), 24);
  assert.equal(run('DATA.fleet[0].reg'), 'D-7209');
  for (let i = 0; i < 8; i++) {
    if (![0, 3].includes(i)) assert.equal(run(`dailyChecklist(${i})`), null);
  }
  for (const i of [0, 3]) {
    const file = run(`dailyChecklist(${i}).document`);
    assert.ok(fs.existsSync(path.join(__dirname, '..', file)));
  }
});

test('ASK completion checks every required item and ignores extra stored entries', () => {
  const { run, elements } = app();
  run('selected = 0; record(0).checks = Array(24).fill(true); updateCount()');
  assert.equal(elements.get('#checkCount').textContent, '24 / 26 erledigt · lokal gespeichert');
  assert.equal(elements.get('#toSign').disabled, true);
  run('record(0).checks = Array(27).fill(true); record(0).checks[10] = false');
  assert.equal(run('dailyComplete(0)'), false);
  run('record(0).checks[10] = true; updateCount()');
  assert.equal(elements.get('#checkCount').textContent, '26 / 26 erledigt · lokal gespeichert');
  assert.equal(elements.get('#toSign').disabled, false);
});

test('signature requires all aircraft-specific items; blockers remain red', () => {
  const { run } = app();
  run('selected = 0; signature = true; record(0).checks = Array(24).fill(true); signRecord()');
  assert.equal(run('record(0).signed'), null);
  assert.equal(run('state.archive.length'), 0);
  run('record(0).checks = Array(26).fill(true); signRecord()');
  assert.equal(run('state.archive.length'), 1);
  assert.equal(run('state.archive[0].aircraft'), 'ASK 21 B');
  assert.equal(run('state.archive[0].revision'), '1.0 / 25.05.2020');
  assert.equal(run('status(0)'), 'red');
  run('state.issues[0] = []');
  assert.equal(run('status(0)'), 'green');
});

test('LS4a signs at 24 items and keeps its independent stored data', () => {
  const { run } = app();
  run('record(3).checks = Array(24).fill(true); record(3).student = "LS4-Test"; selected = 3; signature = true; signRecord()');
  assert.equal(run('state.archive[0].aircraft'), 'LS 4 a');
  assert.equal(run('record(3).student'), 'LS4-Test');
  assert.equal(run('record(0).checks.length'), 0);
  assert.equal(run('dailyComplete(1)'), false);
});

test('ASK renders 26 checkboxes, its own PDF and dynamic sign summary', () => {
  const { run } = app();
  run(`let renderedBody = '';
    function issueCard() { return ''; }
    function showDialog(title, sub, body) { renderedBody = body; }
    function setupSig() {}
    startDaily(0);`);
  assert.equal(run('step'), 'checks');
  assert.equal(run('(renderedBody.match(/type="checkbox"/g) || []).length'), 26);
  assert.equal(run('renderedBody.includes("assets/docs/daily-ask21b.pdf")'), true);
  run('record(0).checks = Array(26).fill(true); step = "sign"; drawDaily()');
  assert.equal(run('renderedBody.includes("26 von 26 Punkten")'), true);
  run('startDaily(3)');
  assert.equal(run('(renderedBody.match(/type="checkbox"/g) || []).length'), 24);
  assert.equal(run('renderedBody.includes("assets/docs/daily-ls4.pdf")'), true);
});
