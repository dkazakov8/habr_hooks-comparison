import _ from 'lodash';
import cn from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

import { observer } from 'utils';
import { Scrollbar } from 'components/Scrollbar';

import { Name } from './Name';
import styles from './Select.scss';

function Option(props) {
  const { value, option, isMulti, hasValue, iconMode, onOptionClick } = props;

  const [optionName, optionValue] = option;
  const isActive = !hasValue
    ? false
    : isMulti
    ? value.some(opt => opt[1] === optionValue)
    : value[1] === optionValue;
  const optionClassName = cn({
    [styles.listItem]: true,
    [styles.active]: isActive,
  });

  return (
    <div
      key={optionValue}
      className={optionClassName}
      onClick={() => (isMulti && isActive ? false : onOptionClick(option, isActive))}
      data-id={optionName}
    >
      <Name iconMode={iconMode} name={optionName} />
      {isMulti && 'del'}
    </div>
  );
}

function areEqual(prevProps, nextProps) {
  // eslint-disable-next-line
  const optionValue = nextProps.option[1];

  if (prevProps.id !== nextProps.id) {
    return false;
  }

  if (!prevProps.isMulti && prevProps.hasValue && nextProps.hasValue) {
    const prevEqual = optionValue === prevProps.value[1];
    const nextEqual = optionValue === nextProps.value[1];

    if ((prevEqual && !nextEqual) || (!prevEqual && nextEqual)) {
      return false;
    }

    return true;
  }

  if (prevProps.isMulti) {
    const prevEqual = prevProps.value.some(opt => opt[1] === optionValue);
    const nextEqual = nextProps.value.some(opt => opt[1] === optionValue);

    if ((prevEqual && !nextEqual) || (!prevEqual && nextEqual)) {
      return false;
    }

    return true;
  }

  return _.isEqual(prevProps.value, nextProps.value);
}

const MemoizedOption = React.memo(Option, areEqual);

function Options(props) {
  const {
    id,
    value,
    isMulti,
    options,
    hasValue,
    iconMode,
    withSearch,
    forwardRef,
    onOptionClick,
  } = props;

  return (
    <Scrollbar autoHeight autoHeightMax={withSearch && !isMulti ? 140 : 170} ref={forwardRef}>
      {options.length === 0 && <div className={styles.noOptions}>No options</div>}
      {options.map(option => (
        <MemoizedOption
          key={option[1]}
          id={id}
          value={value}
          option={option}
          isMulti={isMulti}
          hasValue={hasValue}
          iconMode={iconMode}
          onOptionClick={onOptionClick}
        />
      ))}
    </Scrollbar>
  );
}

Options.propTypes = {
  value: PropTypes.array.isRequired,
  options: PropTypes.array.isRequired,
  isMulti: PropTypes.bool.isRequired,
  iconMode: PropTypes.bool.isRequired,
  hasValue: PropTypes.bool.isRequired,
  withSearch: PropTypes.bool.isRequired,
  forwardRef: PropTypes.object.isRequired,
  onOptionClick: PropTypes.func.isRequired,
};

export const OptionsConnected = observer(Options);
