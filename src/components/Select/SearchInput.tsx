import React from 'react';
import PropTypes from 'prop-types';

import { system } from 'const';
import { observer, getTextWidth } from 'utils';

import styles from './Select.scss';

const searchValueRegex = /[^a-zA-Zа-яА-Я0-9+_.\-#\s]+/g;

function useAutoHeight(ref, withSearch, value) {
  React.useEffect(() => {
    if (!withSearch || !ref.current) {
      return;
    }

    ref.current.style.height = '5px';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [withSearch, value, ref]);
}

function SearchInput(props) {
  const {
    value,
    hasValue,
    isMulti,
    tabIndex,
    setIsOpen,
    forwardRef,
    withSearch,
    searchValue,
    isCreatable,
    setSearchValue,
    setValueBound,
  } = props;

  let finalValue = searchValue;

  if (isCreatable) {
    finalValue = finalValue || hasValue ? value[0] : '';
  }

  useAutoHeight(forwardRef, withSearch, finalValue);

  if (!withSearch && !isCreatable) {
    return null;
  }

  const inputStyle = {};

  if (isMulti) {
    inputStyle.width = `${getTextWidth(finalValue, '12px Roboto') + 5}px`;
  }

  return (
    <div className={styles.searchWrapper}>
      <textarea
        ref={forwardRef}
        name="search"
        value={finalValue}
        style={inputStyle}
        tabIndex={tabIndex}
        maxLength={system.INPUT_MAX_LENGTH}
        placeholder={isMulti || isCreatable ? null : 'Search...'}
        onChange={event => {
          const tempValue = event.target.value.replace(searchValueRegex, '');

          setSearchValue(tempValue);

          if (isCreatable) {
            setValueBound({ option: [tempValue, tempValue] });
          }

          if (isMulti || isCreatable) {
            setIsOpen(true);
          }
        }}
      />
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.array.isRequired,
  isMulti: PropTypes.bool.isRequired,
  tabIndex: PropTypes.number.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  withSearch: PropTypes.bool.isRequired,
  forwardRef: PropTypes.object.isRequired,
  isCreatable: PropTypes.bool.isRequired,
  searchValue: PropTypes.string,
  setSearchValue: PropTypes.func.isRequired,
};

export const SearchInputConnected = observer(SearchInput);
