import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import chalk from 'chalk';
import { ESLint } from 'eslint';

import { env } from '../../env';
import { paths } from '../../paths';
import eslintConfig from '../../eslint.config';
import { Compiler } from '../../lib/ts-interface-builder';

const eslint = new ESLint({
  fix: true,
  extensions: ['.js', '.ts', '.tsx'],
  overrideConfigFile: path.resolve(paths.rootPath, 'eslint.config.js'),
});

const logsPrefix = chalk.blue(`[WEBPACK]`);

const modelsPath = path.resolve(paths.sourcePath, 'models');
const pathsForExportFiles = [
  {
    folderPath: path.resolve(paths.sourcePath, 'const'),
    exportDefault: false,
  },
  {
    folderPath: path.resolve(paths.sourcePath, 'utils'),
    exportDefault: false,
  },
  {
    folderPath: path.resolve(paths.serverPath, 'serverUtils'),
    exportDefault: false,
  },
  {
    folderPath: path.resolve(paths.sourcePath, 'api'),
    exportDefault: false,
  },
  {
    folderPath: path.resolve(paths.sourcePath, 'models'),
    exportDefault: false,
  },
  {
    folderPath: path.resolve(paths.validatorsPath, 'api'),
    exportDefault: true,
  },
];
const pathsForValidationFiles = [
  {
    folderPath: path.resolve(paths.sourcePath, 'api'),
  },
];
const pathsForAssetsExportFiles = [
  {
    folderPath: path.resolve(paths.assetsPath, 'icons'),
    exportDefault: false,
  },
  {
    folderPath: path.resolve(paths.assetsPath, 'images'),
    exportDefault: true,
  },
];

// @ts-ignore
// eslint-disable-next-line prefer-destructuring
const { tabWidth } = eslintConfig.rules['prettier/prettier'][1];

type TypeProcessParams = { changedFiles?: string[] };

class GenerateFiles {
  _saveFile(params: { content?: string; filePath: string; noEslint?: boolean }) {
    const { content, filePath, noEslint } = params;

    if (content == null) return false;

    const oldFileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

    return Promise.resolve()
      .then(() => (noEslint ? content : this._formatTextWithEslint(content)))
      .then(formattedNewContent => {
        if (oldFileContent === formattedNewContent) return false;

        return fs.promises.writeFile(filePath, formattedNewContent, 'utf8').then(() => {
          if (env.LOGS_GENERATE_FILES) console.log(`${logsPrefix} Changed: ${filePath}`);

          return true;
        });
      });
  }

  _objToString(obj: Record<string, any>) {
    // Format like Prettier instead of calling _formatTextWithEslint to save some time
    return `{\n${_.entries(obj)
      .map(pair => `${_.repeat(' ', tabWidth)}${pair.join(': ')}`)
      .join(',\n')},\n};\n`;
  }

  _excludeFileNames(filesNames, skipFiles?: string[]) {
    const skipFilesArray = ['package.json'].concat(skipFiles || []);

    return filesNames.filter(
      fileName => !skipFilesArray.some(testStr => fileName.includes(testStr))
    );
  }

  _formatTextWithEslint(str: string) {
    return eslint.lintText(str).then(data => data[0].output || str);
  }

  _createExportObjectFromFilesArray(params: {
    folderName: string;
    filesNames: string[];
    exportDefault: boolean;
  }) {
    const { folderName, filesNames, exportDefault } = params;

    return filesNames.reduce((exportObject, fileName) => {
      const { name: fileNameNoExt } = path.parse(fileName);

      const paramName = _.camelCase(fileNameNoExt);
      let paramValue = `require('./${folderName}/${fileName}')`;
      paramValue = exportDefault ? `${paramValue}.default` : paramValue;

      return { ...exportObject, [paramName]: paramValue };
    }, {});
  }

  generateExportFiles({ changedFiles }: TypeProcessParams) {
    const config =
      changedFiles == null
        ? pathsForExportFiles
        : pathsForExportFiles.filter(({ folderPath }) =>
            changedFiles.some(filePath => filePath.includes(folderPath))
          );

    if (config.length === 0) return false;

    return Promise.all(
      config.map(({ folderPath, exportDefault }) => {
        const { base: folderName } = path.parse(folderPath);

        const generatedFileName = `_${folderName}.ts`;
        const generatedFilePath = path.resolve(folderPath, generatedFileName);

        return Promise.resolve()
          .then(() => fs.promises.readdir(folderPath))
          .then(filesNames => this._excludeFileNames(filesNames, [generatedFileName]))
          .then(filesNames =>
            filesNames.reduce((template, fileName) => {
              const { name: fileNameNoExt } = path.parse(fileName);

              return exportDefault
                ? `${template}export { default as ${fileNameNoExt} } from './${fileNameNoExt}';\n`
                : `${template}export * from './${fileNameNoExt}';\n`;
            }, '// This file is auto-generated\n\n')
          )
          .then(content =>
            this._saveFile({
              content,
              filePath: generatedFilePath,
              noEslint: true,
            })
          );
      })
    ).then(filesSavedMarks => filesSavedMarks.some(Boolean));
  }

  generateValidationFiles({ changedFiles }: TypeProcessParams) {
    const config =
      changedFiles == null
        ? pathsForValidationFiles
        : pathsForValidationFiles.filter(({ folderPath }) =>
            changedFiles.some(
              filePath => filePath.includes(folderPath) || filePath.includes(modelsPath)
            )
          );

    if (config.length === 0) return false;

    return Promise.all(
      config.map(({ folderPath }) => {
        const { base: folderName } = path.parse(folderPath);

        const generatedFileName = `_${folderName}.ts`;
        const generatedFolderPath = path.resolve(paths.validatorsPath, folderName);

        if (!fs.existsSync(generatedFolderPath)) fs.mkdirSync(generatedFolderPath);

        return Promise.resolve()
          .then(() => fs.promises.readdir(folderPath))
          .then(filesNames => this._excludeFileNames(filesNames, [generatedFileName]))
          .then(filesNames => filesNames.map(fileName => path.resolve(folderPath, fileName)))
          .then(filesPaths =>
            Promise.all(
              Compiler.compile(filesPaths, { inlineImports: true }).map(({ filePath, content }) => {
                const { base: fileName } = path.parse(filePath);

                const generatedFilePath = path.resolve(generatedFolderPath, fileName);

                return this._saveFile({ filePath: generatedFilePath, content });
              })
            )
          );
      })
    ).then(filesSavedMarks => _.flatten(filesSavedMarks).some(Boolean));
  }

  generateAssetsExportFiles({ changedFiles }: TypeProcessParams) {
    const config =
      changedFiles == null
        ? pathsForAssetsExportFiles
        : pathsForAssetsExportFiles.filter(({ folderPath }) =>
            changedFiles.some(filePath => filePath.includes(folderPath))
          );

    if (config.length === 0) return false;

    return Promise.all(
      config.map(({ folderPath, exportDefault }) => {
        const { base: folderName, dir: parentPath } = path.parse(folderPath);

        const generatedFileName = `${folderName}.ts`;
        const generatedFilePath = path.resolve(parentPath, generatedFileName);

        return Promise.resolve()
          .then(() => fs.promises.readdir(folderPath))
          .then(filesNames => {
            const exportObject = this._createExportObjectFromFilesArray({
              folderName,
              filesNames,
              exportDefault,
            });

            return `// This file is auto-generated\n\nexport const ${folderName} = ${this._objToString(
              exportObject
            )}`;
          })
          .then(content =>
            this._saveFile({
              content,
              filePath: generatedFilePath,
              noEslint: true,
            })
          );
      })
    ).then(filesSavedMarks => filesSavedMarks.some(Boolean));
  }

  process({ changedFiles }: TypeProcessParams) {
    const startTime = Date.now();
    const isFirstGeneration = changedFiles == null;
    let filesChanged = false;

    // Order matters
    return Promise.resolve()
      .then(() => this.generateValidationFiles({ changedFiles }))
      .then(changedMark => changedMark && (filesChanged = true))

      .then(() => this.generateExportFiles({ changedFiles }))
      .then(changedMark => changedMark && (filesChanged = true))

      .then(() => this.generateAssetsExportFiles({ changedFiles }))
      .then(changedMark => changedMark && (filesChanged = true))

      .then(() => {
        if (isFirstGeneration || filesChanged) {
          const endTime = Date.now();

          console.log(
            '%s Finished generating files within %s seconds',
            logsPrefix,
            chalk.blue(String((endTime - startTime) / 1000))
          );
        }

        return filesChanged;
      });
  }
}

export const generateFiles = new GenerateFiles();
