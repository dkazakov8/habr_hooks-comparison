import React from 'react';

import { Icon } from 'components/Icon';

import styles from './Select.scss';
import { Name } from './Name';

export function CurrentValue(props) {
  const {
    value,
    hasValue,
    isMulti,
    onClick,
    iconMode,
    forwardRef,
    isCreatable,
    searchInput,
    setValueBound,
  } = props;

  if (!isMulti) {
    if (isCreatable) {
      return (
        <div className={styles.currentValue} ref={forwardRef} onClick={onClick}>
          {searchInput}
        </div>
      );
    }

    return (
      <div
        data-id={hasValue ? value[0] : ''}
        className={styles.currentValue}
        ref={forwardRef}
        onClick={onClick}
      >
        <Name iconMode={iconMode} name={hasValue ? value[0] : ''} />
        <Icon glyph={Icon.glyphs.arrow_bottom} className={styles.arrow} />
      </div>
    );
  }

  return (
    <div className={styles.currentValue} ref={forwardRef} onClick={onClick}>
      {value.map(option => {
        const [optionName, optionValue] = option;

        return (
          <div className={styles.currentValueItem} key={optionValue} data-id={optionName}>
            <Name iconMode={iconMode} name={optionName} />
            <Icon
              glyph={Icon.glyphs.cross}
              className={styles.removeOptionIcon}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();

                setValueBound({ option });
              }}
            />
          </div>
        );
      })}
      {searchInput}
    </div>
  );
}

// CurrentValue.propTypes = {
//   value: PropTypes.array.isRequired,
//   isMulti: PropTypes.bool.isRequired,
//   onClick: PropTypes.func.isRequired,
//   iconMode: PropTypes.bool.isRequired,
//   forwardRef: PropTypes.object.isRequired,
//   isCreatable: PropTypes.bool.isRequired,
//   searchInput: PropTypes.node.isRequired,
//   setValueBound: PropTypes.func.isRequired,
// };
