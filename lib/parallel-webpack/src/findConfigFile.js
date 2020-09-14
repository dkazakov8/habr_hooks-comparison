const fs = require('fs');

const potentialExtensions = [''].concat(Object.keys(require('interpret').jsVariants));

function existsWithAccess(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (ignore) {
    return false;
  }
}

function exists(path) {
  if (fs.accessSync) {
    return existsWithAccess(path);
  } else {
    try {
      const stats = fs.statSync(path);
      return stats.isFile();
    } catch (ignore) {
      return false;
    }
  }
}

module.exports = function findConfigFile(configPath) {
  for (let i = 0, len = potentialExtensions.length; i < len; i++) {
    const ext = potentialExtensions[i];
    if (exists(configPath + ext)) {
      // file exists, use that extension
      return configPath + ext;
    }
  }

  throw new Error('File does not exist');
};
