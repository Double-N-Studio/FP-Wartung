const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./helpers/app.cjs');
const files = ['js/winch/data.js', 'js/winch/checklists/start.js', 'js/winch/checklists/end.js', 'js/winch/launches.js', 'js/winch/model.js', 'js/winch/view.js', 'js/winter/planning.js'];

test('winch is separate from aircraft, winter planning and daily checklists', () => {
  const { run } = app(files);
  assert.equal(run('DATA.fleet.length'), 8);
  assert.equal(run('winterFleet().length'), 7);
  assert.equal(run('issueTarget("winch").name'), 'ACL-Winde');
  assert.equal(run('dailyCheckCount(0)'), 26);
  assert.equal(run('dailyCheckCount(3)'), 24);
});

test('no invented checklist can be confirmed; new days have separate state', () => {
  const { run } = app(files);
  assert.equal(run('winchChecklistReady("start")'), false);
  assert.equal(run('winchChecksComplete("start")'), false);
  run('winchRecord("2026-10-25").start.note="gestern"');
  assert.equal(run('winchRecord("2026-10-26").start.note'), '');
  assert.equal(run('winchRecord("2026-10-25").start.note'), 'gestern');
});

test('shared defect edits, closing and reopening work for winch without affecting aircraft', () => {
  const { run } = app(files);
  run(`selected='winch'; state.issues.winch=[{text:'Seil prüfen',impact:'blocking',open:true}];
    issueEdit={target:'winch',issue:state.issues.winch[0],action:'close'};
    saveIssueEdit({actor:'Nils',reason:'Behoben'});`);
  assert.equal(run('blockers("winch").length'), 0);
  assert.equal(run('blockers(0).length'), 1);
  run(`issueEdit={target:'winch',issue:state.issues.winch[0],action:'reopen'};
    saveIssueEdit({actor:'Nils',reason:'Wieder aufgetreten'});`);
  assert.equal(run('winchStatus()'), 'red');
  assert.equal(run('issueForm().includes("create-work-from-report")'), false);
  assert.equal(run('issueCard(issues("winch")[0],0).includes("workFromIssue")'), false);
});

test('start cannot be signed with blockers or incomplete checks and rolls back on storage failure', () => {
  const { run, elements } = app(files);
  run(`winchActiveDate=today(); WINCH_START_CHECKLIST.revision='TEST'; WINCH_START_CHECKLIST.source='test-only'; WINCH_START_CHECKLIST.groups=[{title:'Test',items:['Testpunkt']}];`);
  assert.equal(run('winchChecksComplete("start")'), false);
  run('setWinchCheck("start",0,true)');
  assert.equal(run('winchChecksComplete("start")'), true);
  run("state.issues.winch=[{text:'Sperre',impact:'blocking',open:true}]");
  assert.equal(run('signWinchPhase("start")'), false);
  run("state.issues.winch=[]; signature=true; localStorage.setItem=()=>{throw Error('quota')}");
  elements.get('#winchCount');
  run("$('#signer').value='Nils'; $('#pin').value='1234'; $('#sig').toDataURL=()=> 'image'");
  assert.equal(run('signWinchPhase("start")'), false);
  assert.equal(run('winchRecord().start.signed'), null);
});
