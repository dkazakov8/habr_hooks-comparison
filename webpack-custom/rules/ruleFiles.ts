/**
 * @docs: https://webpack.js.org/loaders/file-loader
 *
 */

import webpack from 'webpack';

import { loaderFiles } from '../loaders/loaderFiles';

export const ruleFiles: webpack.RuleSetRule = {
  test: /\.(woff2?|jpe?g|png|gif)$/,
  use: [loaderFiles],
};
