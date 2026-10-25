const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./helpers/app.cjs');

test('editing keeps photos, linked work and records the previous classification', () => {
  const { run } = app();
  run(`selected = 0; const x = state.issues[0][0]; x.photos = [{data:'image'}]; x.workId = 'work-1';
    issueEdit = { issue:x, target:0, action:'edit' };
    saveIssueEdit({ text:'Lackschaden', impact:'cosmetic', category:'Lack / Oberfläche', location:'Flügel', priority:'Zeitnah bearbeiten', actor:'Nils', reason:'Technisch bewertet' });`);
  assert.equal(run('issues(0)[0].text'), 'Lackschaden');
  assert.equal(run('issues(0)[0].photos[0].data'), 'image');
  assert.equal(run('issues(0)[0].workId'), 'work-1');
  assert.equal(run('issues(0)[0].history[0].before.impact'), 'blocking');
  assert.equal(run('blockers(0).length'), 0);
});

test('closing removes only that defect from blockers and reopening restores it', () => {
  const { run } = app();
  run(`selected=0; state.issues[0].push({text:'Zweiter Mangel',open:true,impact:'blocking'});
    issueEdit={issue:state.issues[0][0],target:0,action:'close'};
    saveIssueEdit({actor:'Nils',reason:'Behebung dokumentiert'});`);
  assert.equal(run('blockers(0).length'), 1);
  assert.equal(run('state.issues[0].length'), 2);
  assert.equal(run('state.issues[0][0].closedBy'), 'Nils');
  run(`issueEdit={issue:state.issues[0][0],target:0,action:'reopen'};
    saveIssueEdit({actor:'Nils',reason:'Erneut aufgetreten'});`);
  assert.equal(run('blockers(0).length'), 2);
  assert.equal(run('state.issues[0][0].history.length'), 2);
});

test('invalid input and storage failure preserve the original defect', () => {
  const { run } = app();
  run(`issueEdit={issue:state.issues[0][0],target:0,action:'close'};
    const original=JSON.stringify(state.issues[0][0]);`);
  assert.equal(run("saveIssueEdit({actor:'',reason:'x'})"), false);
  run("localStorage.setItem=()=>{throw Error('quota')}");
  assert.equal(run("saveIssueEdit({actor:'Nils',reason:'Behoben'})"), false);
  assert.equal(run('JSON.stringify(state.issues[0][0]) === original'), true);
});
