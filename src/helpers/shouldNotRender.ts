export function shouldNotRender(params) {
  if (params.showBy && params.hideBy) {
    console.error('shouldNotRender: Use one of showBy, hideBy');
  }
  return params.hideBy || params.showBy === false;
}
