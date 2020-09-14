import React from 'react';

import { Icon } from 'components/Icon';

import styles from './Select.scss';

export function Name({ iconMode, name }) {
  return iconMode && Boolean(name) ? <Icon glyph={name} className={styles.icon} /> : name;
}

// Name.propTypes = {
//   name: PropTypes.string.isRequired,
//   iconMode: PropTypes.bool.isRequired,
// };
