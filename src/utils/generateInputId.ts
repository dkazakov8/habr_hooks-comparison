import { translit } from './translit';

const replaceRegex = /([.[\]#\s])/g;

export function generateInputId(storePath) {
  return `Input_${translit(String(storePath)).replace(replaceRegex, '_').toLowerCase()}`;
}
