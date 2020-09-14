/* eslint-disable func-names, no-process-exit */

const chalk = require('chalk');
const { presetToOptions } = require('webpack/lib/Stats');

const loadConfigurationFile = require('./loadConfigurationFile').default;
const { notifyIPCWatchCompileDone, notifyIPCFilesChanged } = require('./watchModeIPC');

/**
 * Choose the most correct version of webpack, prefer locally installed version,
 * fallback to the own dependency if there's none.
 * @returns {*}
 */
function getWebpack() {
  try {
    return require(`${process.cwd()}/node_modules/webpack`);
  } catch (e) {
    return require('webpack');
  }
}

function getAppName(webpackConfig) {
  let appName =
    webpackConfig.name ||
    (webpackConfig.output && webpackConfig.output.filename) ||
    String(process.pid);
  if (appName.indexOf('[name]') !== -1 && typeof webpackConfig.entry === 'object') {
    const entryNames = Object.keys(webpackConfig.entry);
    if (entryNames.length === 1) {
      // we can only replace [name] with the entry point if there is only one entry point
      appName = appName.replace(/\[name]/g, entryNames[0]);
    }
  }
  return appName;
}

function getOutputOptions(webpackConfig, options) {
  let { stats } = webpackConfig;
  // @see https://webpack.js.org/configuration/stats/
  if (typeof stats === 'string') {
    stats = presetToOptions(stats);
  }
  const outputOptions = Object.create(stats || {});
  if (typeof options.modulesSort !== 'undefined') {
    outputOptions.modulesSort = options.modulesSort;
  }
  if (typeof options.chunksSort !== 'undefined') {
    outputOptions.chunksSort = options.chunksSort;
  }
  if (typeof options.assetsSort !== 'undefined') {
    outputOptions.assetsSort = options.assetsSort;
  }
  if (typeof options.exclude !== 'undefined') {
    outputOptions.exclude = options.exclude;
  }
  if (typeof options.colors !== 'undefined') {
    outputOptions.colors = options.colors;
  }
  return outputOptions;
}

/**
 * Create a single webpack build using the specified configuration.
 * Calls the done callback once it has finished its work.
 *
 * @param {string} configuratorFileName The app configuration filename
 * @param {Object} options The build options
 * @param {boolean} options.watch If `true`, then the webpack watcher is being run; if `false`, runs only ones
 * @param {boolean} options.json If `true`, then the webpack watcher will only report the result as JSON but not produce any other output
 * @param {number} index The configuration index
 * @param {number} expectedConfigLength
 * @param {Function} done The callback that should be invoked once this worker has finished the build.
 */
module.exports = function (configuratorFileName, options, index, expectedConfigLength, done) {
  chalk.enabled = options.colors;
  const config = loadConfigurationFile(configuratorFileName);

  const watch = Boolean(options.watch);
  const silent = Boolean(options.json);
  if (
    (expectedConfigLength !== 1 && !Array.isArray(config)) ||
    (Array.isArray(config) && config.length !== expectedConfigLength)
  ) {
    if (config.length !== expectedConfigLength) {
      const errorMessage =
        '[WEBPACK] There is a difference between the amount of the' +
        ' provided configs. Maybe you where expecting command line' +
        ' arguments to be passed to your webpack.config.js. If so,' +
        " you'll need to separate them with a -- from the parallel-webpack options.";
      console.error(errorMessage);
      throw Error(errorMessage);
    }
  }
  let webpackConfig;
  if (Array.isArray(config)) {
    webpackConfig = config[index];
  } else {
    webpackConfig = config;
  }

  const MSG_ERROR = chalk.red('[WEBPACK]');
  const MSG_SUCCESS = chalk.blue('[WEBPACK]');
  const MSG_APP = chalk.yellow(getAppName(webpackConfig));

  let watcher;
  const webpack = getWebpack();
  let hasCompletedOneCompile = false;
  const outputOptions = getOutputOptions(webpackConfig, options);
  let disconnected = false;

  if (!silent) {
    console.log('%s Started %s %s', MSG_SUCCESS, watch ? 'watching' : 'building', MSG_APP);
  }

  const compiler = webpack(webpackConfig);
  let generationFinishTime = new Date().getTime();

  if (watch || webpack.watch) {
    watcher = compiler.watch(webpackConfig.watchOptions, finishedCallback);
    compiler.hooks.watchRun.tapAsync('GenerateFiles', (comp, callback) => {
      const w = comp.watchFileSystem.watcher || comp.watchFileSystem.wfs.watcher;
      const changedTimes = w.mtimes;
      const changedFiles = Object.keys(changedTimes);

      notifyIPCFilesChanged(index, changedFiles, (/* filesChanged */) => {
        generationFinishTime = new Date().getTime();
        callback();
      });
    });
  } else {
    compiler.run(finishedCallback);
  }

  process.on('SIGINT', shutdownCallback);
  process.on('exit', exitCallback);
  process.on('unhandledRejection', unhandledRejectionCallback);
  process.on('disconnect', disconnectCallback);

  function cleanup() {
    process.removeListener('SIGINT', shutdownCallback);
    process.removeListener('exit', exitCallback);
    process.removeListener('unhandledRejection', unhandledRejectionCallback);
    process.removeListener('disconnect', disconnectCallback);
  }

  function shutdownCallback() {
    if (watcher) {
      watcher.close(done);
    }
    done({
      message: `${MSG_ERROR} Forcefully shut down ${MSG_APP}`,
    });
    process.exit(0);
  }

  function unhandledRejectionCallback(error) {
    console.log(`${MSG_ERROR}Build child process error:`, error);
    process.exit(1);
  }

  function exitCallback(code) {
    cleanup();
    if (code === 0) {
      return;
    }
    if (watcher) {
      watcher.close(done);
    }
    done({
      message: `${MSG_ERROR} Exit ${MSG_APP} with code ${code}`,
    });
  }

  function disconnectCallback() {
    disconnected = true;
    console.log('%s Parent process terminated, exit building %s', MSG_ERROR, MSG_APP);
    process.exit(1);
  }

  function finishedCallback(err, stats) {
    if (err) {
      console.error('%s fatal error occured', MSG_ERROR);
      console.error(err);
      cleanup();
      return done(err);
    }
    if (stats.compilation.errors && stats.compilation.errors.length) {
      const message = `${MSG_ERROR} Errors building ${MSG_APP}\n${stats.compilation.errors
        .map(function (error) {
          return error.message;
        })
        .join('\n')}`;
      if (watch) {
        console.log(message);
      } else {
        cleanup();
        if (disconnected) {
          return;
        }
        return done({
          message,
          stats: JSON.stringify(stats.toJson(outputOptions), null, 2),
        });
      }
    }
    if (!silent) {
      if (options.stats) console.log(stats.toString(outputOptions));

      const deltaTime = stats.endTime - (watch ? generationFinishTime : stats.startTime);
      const timeStamp = watch ? ` ${chalk.yellow(new Date().toTimeString().split(/ +/)[0])}` : '';
      console.log(
        '%s Finished building %s within %s seconds',
        chalk.blue(`[WEBPACK${timeStamp}]`),
        MSG_APP,
        chalk.blue(deltaTime / 1000)
      );
    }
    if (!watch) {
      cleanup();
      if (disconnected) {
        return;
      }
      done(null, options.stats ? JSON.stringify(stats.toJson(outputOptions), null, 2) : '');
    } else if (!hasCompletedOneCompile) {
      notifyIPCWatchCompileDone(index);
      hasCompletedOneCompile = true;
    }
  }
};
