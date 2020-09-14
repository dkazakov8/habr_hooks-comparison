const ipc = require('node-ipc');

const serverName = 'webpack';
const watchDoneHandler = require('./watchDoneHandler');

let isConnected = false;

module.exports = {
  /**
   * Start IPC server and listens for 'done' message from child processes
   * @param {any} callback - callback invoked once 'done' has been emitted by each confugration
   * @param {any} configIndices - array indices of configuration
   * @param {any} beforeRebuild
   */
  startWatchIPCServer(callback, configIndices, beforeRebuild) {
    ipc.config.id = serverName;
    ipc.config.retry = 3;
    ipc.config.silent = true;

    let filesGenerating = false;

    ipc.serve(() => {
      ipc.server.on('done', watchDoneHandler.bind(this, callback, ipc, configIndices));
      ipc.server.on('beforeBuild', changedFiles => {
        if (filesGenerating) return false;

        filesGenerating = true;

        Promise.resolve()
          // should wait until all interested processes have triggered 'beforeBuild'
          .then(() => new Promise(resolve => setTimeout(resolve, 20)))
          .then(() => beforeRebuild({ changedFiles }))
          .then(filesChanged => {
            ipc.server.broadcast('beforeBuildPassed', filesChanged);

            filesGenerating = false;
          });
      });
    });
    ipc.server.start();
  },

  /*
   * Notifies parent process that a complete compile has occured in watch mode
   * @param {any} index
   */
  notifyIPCWatchCompileDone(index) {
    ipc.config.id = serverName + index;
    ipc.config.stopRetrying = 3;
    ipc.config.silent = true;

    ipc.connectTo(serverName, () => {
      ipc.of.webpack.emit('done', index);
    });
  },

  notifyIPCFilesChanged(index, changedFiles, callback) {
    ipc.config.id = serverName + index;
    ipc.config.stopRetrying = 3;
    ipc.config.silent = true;

    if (isConnected) return ipc.of.webpack.emit('beforeBuild', changedFiles);

    ipc.connectTo(serverName, () => {
      isConnected = true;

      ipc.of.webpack.on('beforeBuildPassed', changedMark => callback(changedMark));
      ipc.of.webpack.emit('beforeBuild', changedFiles);
    });
  },
};
