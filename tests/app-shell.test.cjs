// Integrationsprüfung der tatsächlichen Script-Reihenfolge und gerenderten HTML-Texte.
// Ersetzt keine visuelle Browserprüfung.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('all scripts load and aircraft, winch, reports and winter render together', () => {
  const nodes = new Map();
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML:'', textContent:'', value:'', style:{}, open:false,
      classList:{toggle(){}}, addEventListener(){}, querySelectorAll:()=>[],
      showModal(){this.open=true}, close(){this.open=false},
    });
    return nodes.get(selector);
  };
  const context = vm.createContext({
    Intl, Date, JSON, setTimeout:()=>{},
    localStorage:{getItem:()=>null,setItem(){}},
    document:{querySelector:node,querySelectorAll:()=>[],body:node('body'),addEventListener(){}},
  });
  const root = path.join(__dirname,'..');
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  for (const match of html.matchAll(/<script src="([^"]+)"/g)) {
    vm.runInContext(fs.readFileSync(path.join(root,match[1]),'utf8'),context,{filename:match[1]});
  }
  const run = s => vm.runInContext(s,context);
  assert.ok(node('#equipment').innerHTML.includes('acl-winde.png'));
  run('startDaily(0)');
  assert.equal((node('#dialogContent').innerHTML.match(/type="checkbox"/g)||[]).length,26);
  run('closeDialog(); openWinch()');
  assert.ok(node('#dialogContent').innerHTML.includes('Dienstende'));
  run("openWinch('end')");
  assert.ok(node('#dialogContent').innerHTML.includes('Trommel 1 / Seil 1'));
  assert.ok(node('#dialogContent').innerHTML.includes('Trommel 2 / Seil 2'));
  assert.equal(node('#winchConfirm').disabled,true);
  run('openIssueReport()');
  assert.ok(node('#reportContent').innerHTML.includes('ACL-Winde'));
  assert.ok(!node('#reportContent').innerHTML.includes('create-work-from-report'));
  run("$('#reportDialog').close(); closeDialog(); mode='winter';render()");
  assert.equal(run('winterFleet().length'),7);
  assert.ok(!node('#app').innerHTML.includes('ACL-Winde'));
});
