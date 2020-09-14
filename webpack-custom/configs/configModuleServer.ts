/**
 * @docs: https://webpack.js.org/configuration/module
 *
 */

import webpack from 'webpack';

import { ruleSvgInline } from '../rules/ruleSvgInline';
import { ruleSassServer } from '../rules/ruleSassServer';
import { ruleBabelServer } from '../rules/ruleBabelServer';
import { ruleFilesServer } from '../rules/ruleFilesServer';

export const configModuleServer: webpack.Configuration['module'] = {
  rules: [ruleSassServer, ruleBabelServer, ruleFilesServer, ruleSvgInline],
};
