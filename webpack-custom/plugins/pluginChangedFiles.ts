import webpack from 'webpack';

import { generateFiles } from '../utils/generateFiles';

class ChangedFiles {
  apply(compiler: webpack.Compiler) {
    compiler.hooks.watchRun.tapAsync('GenerateFiles_WatchRun', (comp, done) => {
      // @ts-ignore
      const watcher = comp.watchFileSystem.watcher || comp.watchFileSystem.wfs.watcher;
      const changedFiles = Object.keys(watcher.mtimes);

      return changedFiles.length
        ? generateFiles.process({ changedFiles }).then(() => done())
        : done();
    });
  }
}

export const pluginChangedFiles: webpack.Plugin = new ChangedFiles();
