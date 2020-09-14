import path from 'path';

const rootPath = __dirname;

export const paths = {
  rootPath,
  buildPath: path.resolve(rootPath, 'build'),
  typesPath: path.resolve(rootPath, 'types-custom'),
  assetsPath: path.resolve(rootPath, 'src/assets'),
  serverPath: path.resolve(rootPath, 'server'),
  sourcePath: path.resolve(rootPath, 'src'),
  stylesPath: path.resolve(rootPath, 'src/styles'),
  templatesPath: path.resolve(rootPath, 'templates'),
  validatorsPath: path.resolve(rootPath, 'src/validators'),
  nodeModulesPath: path.resolve(rootPath, 'node_modules'),
};
