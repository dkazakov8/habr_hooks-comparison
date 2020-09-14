/**
 * @docs: https://github.com/trivago/parallel-webpack
 *
 */

import path from 'path';
import { exec } from 'child_process';

import watch from 'node-watch';
import { run } from 'parallel-webpack';

import { env } from '../env';
import { paths } from '../paths';
import { clearFolder } from '../server/serverUtils/clearFolder';

import { generateFiles } from './utils/generateFiles';

function startFileWatcher() {
  let changedFiles = [];
  let isGenerating = false;
  let watchDebounceTimeout = null;

  watch(paths.sourcePath, { recursive: true }, function fileChanged(event, filePath) {
    if (filePath) changedFiles.push(filePath);

    if (isGenerating) return false;

    clearTimeout(watchDebounceTimeout);
    watchDebounceTimeout = setTimeout(() => {
      isGenerating = true;

      generateFiles.process({ changedFiles }).then(() => {
        isGenerating = false;

        if (changedFiles.length > 0) fileChanged(null, null);
      });

      changedFiles = [];
    }, 10);
  });
}

function afterFirstBuild() {
  startFileWatcher();

  /**
   * Start server & proxy it's stdout/stderr to current console
   *
   */

  if (!env.START_SERVER_AFTER_BUILD) return false;

  const serverProcess = exec('better-npm-run -s start');

  serverProcess.stdout.on('data', msg => console.log('[server]', msg.trim()));
  serverProcess.stderr.on('data', msg => console.error('[server]', msg.trim()));

  /**
   * Start watch server & proxy it's stdout/stderr to current console
   *
   */

  if (!env.HOT_RELOAD) return false;

  const reloadServerProcess = exec('better-npm-run -s reload-browser');

  reloadServerProcess.stdout.on('data', msg => console.log('[reload-browser]', msg.trim()));
  reloadServerProcess.stderr.on('data', msg => console.error('[reload-browser]', msg.trim()));
}

const parallelOptions = {
  stats: true,
  watch: env.HOT_RELOAD,
  colors: true,
  maxRetries: 1,
  maxConcurrentWorkers: 2,
};

Promise.resolve()
  .then(() => clearFolder(paths.buildPath))
  .then(() => generateFiles.process({}))
  .then(() =>
    run(path.resolve(__dirname, 'webpackParallel.config.ts'), parallelOptions, afterFirstBuild)
  )
  .catch(console.error);
