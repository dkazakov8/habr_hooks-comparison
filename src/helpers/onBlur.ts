export function onBlur({ setIsFocused, setErrors, validation, value, store, validationParams }) {
  return function onBlurInner() {
    setIsFocused(false);

    setErrors(
      validation.filter(({ validator }) => {
        return validator(value, store, validationParams);
      })
    );
  };
}
