import { toJS } from 'mobx';

function createConsoleJsLogger() {
  console.js = function consoleJsCustom(...args) {
    console.log(...args.map(arg => toJS(arg, { recurseEverything: true })));
  };
}

export function isomorphPolyfills() {
  createConsoleJsLogger();
}
