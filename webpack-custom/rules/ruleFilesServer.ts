/**
 * @docs: https://webpack.js.org/loaders/file-loader
 *
 */

import webpack from 'webpack';

import { loaderFilesServer } from '../loaders/loaderFilesServer';

export const ruleFilesServer: webpack.RuleSetRule = {
  test: /\.(woff2?|jpe?g|png|gif)$/,
  use: [loaderFilesServer],
};
