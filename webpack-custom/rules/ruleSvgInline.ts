/**
 * @docs: https://webpack.js.org/loaders/svg-inline-loader
 *
 */

import webpack from 'webpack';

import { loaderSvgInline } from '../loaders/loaderSvgInline';

export const ruleSvgInline: webpack.RuleSetRule = {
  test: /\.svg$/,
  use: [loaderSvgInline],
};
