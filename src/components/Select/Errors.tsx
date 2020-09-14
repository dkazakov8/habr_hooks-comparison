import React from 'react';
import cn from 'classnames';

import { observer } from 'utils';
import { TypeSelect } from 'models';

import styles from './Select.scss';

type PropsErrors = {
  errors: TypeSelect['errors'];
};

export const Errors: React.FC<PropsErrors> = observer<PropsErrors>(({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className={cn(styles.errors, styles.right)}>
      <div className={styles.errorsInner}>
        {errors.map(({ message }, index) => (
          <div className={styles.errorItem} key={index}>
            {message}
          </div>
        ))}
      </div>
    </div>
  );
});
