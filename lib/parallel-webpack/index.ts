import _ from 'lodash';
import chalk from 'chalk';
import workerFarm from 'worker-farm';
import pluralize from 'pluralize';

import { startWatchIPCServer } from './src/watchModeIPC';

const loadConfigurationFile = require('./src/loadConfigurationFile').default;

function startFarm(config, configPath, options, worker, afterFirstBuild) {
  const configNormalized = Array.isArray(config) ? config : [config];

  // When in watch mode and a callback is provided start IPC server to invoke callback
  // once all webpack configurations have been compiled
  if (options.watch) {
    startWatchIPCServer(afterFirstBuild, Object.keys(config), options.beforeRebuild);
  }

  console.log(
    `${chalk.blue('[WEBPACK]')} Building ${chalk.yellow(
      String(configNormalized.length)
    )} ${pluralize('target', configNormalized.length)}`
  );

  options.isGenerating = false;

  const builds = configNormalized.map(
    (c, i) =>
      new Promise((resolve, reject) =>
        worker(configPath, options, i, configNormalized.length, (err, data) =>
          err ? reject(err) : resolve(data)
        )
      )
  );

  return Promise.all(builds);
}

interface Options {
  stats?: boolean;
  watch?: boolean;
  colors: boolean;
  maxRetries?: number;
  autoStart?: boolean;
  maxCallTime?: number;
  maxCallsPerWorker?: number;
  maxConcurrentCalls?: number;
  maxConcurrentWorkers?: number;
  maxConcurrentCallsPerWorker?: number;
  keepAliveAfterFinish?: number;
  beforeRebuild?: any;
}

export function run(configPath: string, options: Options, afterFirstBuild: () => any) {
  let config;
  const farmOptions = _.assign({}, options);

  try {
    config = loadConfigurationFile(configPath);
  } catch (e) {
    return Promise.reject(
      new Error(
        `${chalk.red('[WEBPACK]')} Could not load configuration file ${chalk.underline(
          configPath
        )}\n${e}`
      )
    );
  }

  const workers = workerFarm(farmOptions, require.resolve('./src/webpackWorker'));

  function shutdownCallback() {
    console.log(`${chalk.red('[WEBPACK]')} Forcefully shutting down`);

    workerFarm.end(workers);
  }

  function finalCallback() {
    workerFarm.end(workers);
    process.removeListener('SIGINT', shutdownCallback);
  }

  process.on('SIGINT', shutdownCallback);

  const startTime = Date.now();
  const farmPromise = startFarm(config, configPath, options, workers, afterFirstBuild)
    .then(results => {
      console.log(
        '%s Finished build after %s seconds',
        chalk.blue('[WEBPACK]'),
        chalk.blue(String((Date.now() - startTime) / 1000))
      );
      const resultsFiltered = results.filter(Boolean);

      if (resultsFiltered.length) return resultsFiltered;
    })
    .catch(err => {
      console.log(
        '%s Build failed after %s seconds',
        chalk.red('[WEBPACK]'),
        chalk.blue(String((Date.now() - startTime) / 1000))
      );

      return Promise.reject(err);
    })
    .finally(() => {
      if (options.keepAliveAfterFinish) {
        return setTimeout(finalCallback, options.keepAliveAfterFinish);
      }

      return finalCallback();
    });

  if (!options.watch) {
    // @ts-ignore
    farmPromise.asCallback(afterFirstBuild);
  }
  return farmPromise;
}
