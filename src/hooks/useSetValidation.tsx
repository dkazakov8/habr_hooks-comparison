import React from 'react';
import _ from 'lodash';

import { system } from 'const';

import { useStore } from './useStore';

export function useSetValidation({
  value,
  showBy,
  disabled,
  storePath,
  setErrors,
  validation,
  validationParams,
}) {
  const store = useStore();

  React.useLayoutEffect(() => {
    const validationFnPath = `${storePath}${system.VALIDATION_FN_SUFFIX}`;

    if (!validation) {
      console.error(`Отсутствует обязательный параметр ${storePath}${system.VALIDATION_SUFFIX}`);

      return;
    }

    if (showBy === false || disabled === true) {
      _.set(store, validationFnPath, _.stubTrue);

      return;
    }

    _.set(store, validationFnPath, () => {
      const errorsArray = validation.filter(({ validator }) =>
        validator(value, store, validationParams)
      );

      setErrors(errorsArray);

      return errorsArray.length === 0;
    });
  });
}
