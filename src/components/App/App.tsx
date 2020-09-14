import React from 'react';

import { icons } from 'assets/icons';
import { images } from 'assets/images';
import { auth } from 'api';

import styles from './App.scss';

export class App extends React.Component {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.title}>Hello, World!</div>
        <div className={styles.icon} dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
        <div className={styles.image}>
          <img src={images.apples} />
        </div>
      </div>
    );
  }
}
