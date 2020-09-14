export function onFocus(params) {
  return function onFocusInner() {
    params.setIsFocused(true);

    params.setErrors([]);
  };
}
