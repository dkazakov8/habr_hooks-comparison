export function getTextWidth(text, font) {
  if (!document) return 0;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;

  return Math.ceil(context.measureText(text).width);
}
