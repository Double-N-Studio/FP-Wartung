const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./helpers/app.cjs');
const files = ['js/winch/data.js','js/winch/checklists/start.js','js/winch/checklists/end.js','js/winch/model.js','js/winch/launches.js','js/winch/view.js'];
function readyApp() {
  const a = app(files);
  a.run(`winchActiveDate=today(); selected='winch';
    WINCH_END_CHECKLIST.revision='TEST'; WINCH_END_CHECKLIST.source='test-only';
    WINCH_END_CHECKLIST.groups=[{title:'Test',items:['Testpunkt']}];
    winchRecord().start.signed={name:'Test'}; winchRecord().end.checks=[true];`);
  return a;
}

test('start counts require both drums, allow zero and reject invalid numbers', () => {
  const { run } = readyApp();
  for (const bad of ['', '-1', '1.2', '1e2', 'Infinity', '9007199254740992']) {
    assert.equal(run(`saveWinchLaunches(${JSON.stringify(bad)},'2')`), false);
  }
  assert.equal(run("saveWinchLaunches('0','0')"), true);
  assert.equal(run('winchRecord().end.launches.drum1'), 0);
  assert.equal(run('winchLaunchTotals().drum1'), 0);
});

test('repeated saves replace counts, signature snapshots lock them and totals count once', () => {
  const { run } = readyApp();
  run("saveWinchLaunches('5','6'); saveWinchLaunches('7','8')");
  assert.equal(run('winchRecord().end.launches.drum1'), 7);
  assert.equal(run('winchLaunchTotals().drum1'), 0);
  run(`function drawWinch() {}; signature=true;
    $('#signer').value='Nils'; $('#pin').value='1234'; $('#sig').toDataURL=()=> 'image';
    state.issues.winch=[{text:'Nach Dienst festgestellter Mangel',impact:'blocking',open:true}];`);
  assert.equal(run('signWinchPhase("end")'), true);
  assert.equal(run('winchLaunchTotals().drum1'), 7);
  assert.equal(run('winchLaunchTotals().drum2'), 8);
  assert.equal(run("saveWinchLaunches('9','9')"), false);
  assert.equal(run('signWinchPhase("end")'), false);
  assert.equal(run('winchStatus()'), 'red');
  run('state.issues.winch=[]');
  assert.equal(run('winchStatusText()'), 'DIENST BEENDET');
});

test('missing start, missing template or unsaved counts block finalization', () => {
  const { run } = readyApp();
  run("saveWinchLaunches('1','2'); winchLaunchDirty=true");
  assert.equal(run('winchCanConfirm("end")'), false);
  run('winchLaunchDirty=false; winchRecord().start.signed=null');
  assert.equal(run('winchCanConfirm("end")'), false);
  run("winchRecord().start.signed={name:'Test'}; WINCH_END_CHECKLIST.groups=[]");
  assert.equal(run('winchCanConfirm("end")'), false);
});

test('storage failure and day rollover cannot overwrite saved counts', () => {
  const { run } = readyApp();
  run("saveWinchLaunches('3','4'); localStorage.setItem=()=>{throw Error('quota')}");
  assert.equal(run("saveWinchLaunches('8','9')"), false);
  assert.equal(run('winchRecord().end.launches.drum1'), 3);
  run("winchActiveDate='2000-01-01'");
  assert.equal(run("saveWinchLaunches('8','9')"), false);
  assert.equal(run('winchRecord().end.launches.drum2'), 4);
});
