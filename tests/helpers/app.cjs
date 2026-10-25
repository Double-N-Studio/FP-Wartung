const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
module.exports = function app(extra = []) {
  const elements = new Map();
  const context = vm.createContext({
    Intl, Date, JSON, setTimeout: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { querySelector: selector => {
      if (!elements.has(selector)) elements.set(selector, {
        value: '', style: {}, open: false, textContent: '', innerHTML: '',
        close() { this.open = false; }, showModal() { this.open = true; },
      });
      return elements.get(selector);
    } },
  });
  for (const file of [
    'js/data.js', 'js/core/utils.js', 'js/core/state.js', 'js/core/ui-state.js',
    'js/daily/checklists/ask21b.js', 'js/daily/checklists.js',
    'js/daily/status.js', 'js/daily/daily-check.js', 'js/daily/issues.js',
    'js/daily/issue-lifecycle.js', ...extra,
  ]) vm.runInContext(fs.readFileSync(path.join(__dirname, '../..', file), 'utf8'), context);
  vm.runInContext('function render() {}', context);
  return { run: code => vm.runInContext(code, context), elements };
};
