import _ from 'lodash';
import cn from 'classnames';
import React from 'react';

import { icons } from 'assets/icons';

import styles from './Icon.scss';

interface IconProps {
  id?: string;
  glyph: string;
  onClick?: any;
  className?: string;
}

export class Icon extends React.Component<IconProps> {
  static glyphs: typeof icons = _.mapValues(icons, (_value, key) => key);

  render() {
    const { glyph, className, ...props } = this.props;
    const iconContent = icons[glyph];

    if (!iconContent) console.error(`Icon: no icon for glyph ${glyph}`);

    return !iconContent ? null : (
      <div
        {...props}
        className={cn(styles.icon, className)}
        dangerouslySetInnerHTML={{ __html: iconContent }}
      />
    );
  }
}
