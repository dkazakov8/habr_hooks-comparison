const jsVars = require('interpret').jsVariants;
const availableExts = Object.keys(jsVars);
const chalk = require('chalk');
const _ = require('lodash');

// sort extensions to ensure that .babel.js and
// similar ones are always matched before .js
availableExts.sort(function s(a, b) {
  const res = -(a.split(/\./).length - b.split(/\./).length);
  // all things being equal, we need to
  // prioritize .js as it is most likely
  if (res === 0) {
    if (a === '.js') return -1;
    if (b === '.js') return 1;
    return 0;
  }
  return res;
});

function getMatchingLoaderFn(configPath, extensions, variants) {
  const availableExtensions = extensions || availableExts;
  const jsVariants = variants || jsVars;
  for (let i = 0, len = availableExtensions.length; i < len; i++) {
    const ext = availableExtensions[i];
    if (_.endsWith(configPath, ext)) {
      return jsVariants[ext];
    }
  }
  return null;
}

function callConfigFunction(fn) {
  return fn(require('minimist')(process.argv, { '--': true }).env || {});
}

function getConfig(configPath) {
  const configModule = require(configPath);
  const configDefault =
    configModule && configModule.__esModule ? configModule.default : configModule;
  return typeof configDefault === 'function' ? callConfigFunction(configDefault) : configDefault;
}

module.exports = {
  default(configPath, matchingLoader) {
    const getMatchingLoader = matchingLoader || getMatchingLoaderFn;

    let mod = getMatchingLoader(configPath);
    if (mod) {
      const mods = Array.isArray(mod) ? mod : [mod];
      let installed = false;

      for (let i = 0, len = mods.length; i < len; i++) {
        mod = mods[i];
        if (typeof mod === 'string') {
          try {
            require(mod);
            installed = true;
          } catch (ignored) {
            // none
          }
        } else if (typeof mod === 'object') {
          try {
            const s = require(mod.module);
            mod.register(s);
            installed = true;
          } catch (ignored) {
            // none
          }
        }

        if (installed) {
          break;
        }
      }

      if (!installed) {
        throw new Error(
          `Could not load required module loading for ${chalk.underline(configPath)}`
        );
      }
    }
    return getConfig(configPath);
  },
  getMatchingLoader: getMatchingLoaderFn,
  availableExtensions: availableExts,
};
