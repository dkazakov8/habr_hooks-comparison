import React from 'react';

import { Select } from 'components/Select';
import { observer } from 'utils';
import { useStore } from 'hooks';

import styles from './App.scss';

export const App: React.FC = observer(() => {
  const store = useStore();

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Hello, World!</div>
      <Select config={store.hooksSelectConfig} />
    </div>
  );
});
