import React from 'react';

import styles from './Scrollbar.scss';

export function renderViewDefault(props) {
  return <div {...props} />;
}

export function renderTrackHorizontalDefault() {
  return <div className={styles.trackHorizontal} />;
}

export function renderThumbHorizontalDefault() {
  return <div className={styles.thumbHorizontal} />;
}

export function renderTrackVerticalDefault() {
  return <div className={styles.trackVertical} />;
}

export function renderThumbVerticalDefault() {
  return <div className={styles.thumbVertical} />;
}
