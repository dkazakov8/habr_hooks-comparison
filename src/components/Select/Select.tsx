import _ from 'lodash';
import React from 'react';
import cn from 'classnames';

import { observer } from 'utils';
import { useClickOutside, useSetValidation, usePrevious } from 'hooks';
import { TypeSelect } from 'models';

import { shouldNotRender } from '../../helpers';

import { LabelConnected } from './Label';
import { Errors } from './Errors';
import { CurrentValue } from './CurrentValue';
import { OptionsConnected } from './Options';
import { SearchInputConnected } from './SearchInput';
import styles from './Select.scss';

type PropsSelect = {
  config: TypeSelect;
};

type SelectRefs = {
  selectRef: React.RefObject<HTMLDivElement>;
  searchRef: React.RefObject<any>;
  scrollbarRef: React.RefObject<any>;
  selectListRef: React.RefObject<any>;
};

function useOnOpen(params) {
  const {
    disabled,
    firstRender,
    hasValue,
    isCreatable,
    isMulti,
    isOpen,
    searchRef,
    setErrors,
    setFirstRender,
    setSearchValue,
    store,
    validation,
    value,
  } = params;

  React.useEffect(() => {
    if (isOpen) {
      setFirstRender(false);
    }

    if (!firstRender && validation && !disabled) {
      validate({ validation, isOpen, setErrors, value, store });
    }

    if (isCreatable) {
      if (!isOpen) {
        setSearchValue(hasValue ? value[0] : '');
      }

      return;
    }

    setSearchValue('');

    if (isOpen && !isMulti) {
      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }, 210);
    }
  }, [
    disabled,
    firstRender,
    hasValue,
    isCreatable,
    isMulti,
    isOpen,
    searchRef,
    setErrors,
    setFirstRender,
    setSearchValue,
    store,
    validation,
    value,
  ]);
}

function useOpenToTop(params) {
  const { isOpen, selectCurrentRef, selectListRef } = params;
  const [openToTop, setOpenToTop] = React.useState(false);
  const [translateY, setTranslateY] = React.useState(-99999);

  React.useEffect(() => {
    if (!selectCurrentRef.current || !selectListRef.current || !isOpen) {
      setTranslateY(-99999);

      return;
    }

    const listHeight = selectListRef.current.offsetHeight;
    const selectRect = selectCurrentRef.current.getBoundingClientRect();
    const availableTopHeight = selectRect.top;
    const availableBottomHeight = window.innerHeight - selectRect.bottom;
    const toTop = listHeight <= availableTopHeight && listHeight > availableBottomHeight;

    if (toTop) {
      setTranslateY(0);
    } else {
      setTranslateY(selectRect.height);
    }

    setOpenToTop(toTop);
  }, [selectCurrentRef, selectListRef, isOpen]);

  return [openToTop, translateY];
}

function useDisabledChange(params) {
  const { disabled, setErrors, setValueBound } = params;
  const prevDisabled = usePrevious(disabled);

  React.useEffect(() => {
    if (!prevDisabled && disabled) {
      setErrors([]);
      setValueBound({ clear: true });
    }
  }, [prevDisabled, disabled, setErrors, setValueBound]);
}

function useScrollToCurrentOption(params) {
  const { isOpen, isMulti, currentOptionIndex, selectRef, scrollbarRef } = params;

  React.useEffect(() => {
    if (isMulti || isOpen === false || !selectRef.current || !scrollbarRef.current) {
      return;
    }

    const optionEl = selectRef.current.querySelectorAll(`.${styles.listItem}`)[currentOptionIndex];

    if (optionEl) {
      scrollbarRef.current.scrollTop(optionEl.offsetTop);
    }
  }, [isOpen, currentOptionIndex, isMulti, selectRef, scrollbarRef]);
}

function setValue(params) {
  const { store, isMulti, options, searchRef, storePath } = params;

  return function setValueBound({ option, optionIndex, clear }) {
    const value = _.get(store, storePath);

    if (clear) {
      return _.set(store, storePath, []);
    }

    let readyOption = option;

    if (!readyOption && optionIndex != null && optionIndex < options.length && optionIndex >= 0) {
      readyOption = options[optionIndex];
    }

    if (readyOption) {
      if (!isMulti) {
        return _.set(store, storePath, readyOption);
      }

      const newValue = value.slice();
      const optIndex = _.findIndex(value, opt => opt[1] === readyOption[1]);

      searchRef.current.focus();

      if (optIndex !== -1) {
        newValue.splice(optIndex, 1);
        return _.set(store, storePath, newValue);
      }

      newValue.push(readyOption);
      _.set(store, storePath, newValue);
    }
  };
}

function validate({ validation, isOpen, setErrors, value, store }) {
  setErrors(isOpen ? [] : validation.filter(({ validator }) => validator(value, store)));
}

function onSelectClick({ config, refs }: { config: TypeSelect; refs: SelectRefs }) {
  return function onSelectClickInner() {
    const { isMulti, isCreatable, isOpen } = config;
    const { searchRef } = refs;

    if (isMulti || isCreatable) {
      searchRef.current.focus();

      config.isOpen = true;

      return false;
    }

    config.isOpen = !isOpen;
  };
}

function onOptionClick(params) {
  const { isMulti, searchRef, setValueBound, setIsOpen } = params;

  return function onOptionClickInner(option, isActive) {
    if (isMulti) {
      searchRef.current.focus();

      return setValueBound({ option });
    }

    if (isActive) {
      return false;
    }

    setValueBound({ option });
    setIsOpen(false);
  };
}

function onWrapperKeyDown(params) {
  return function onWrapperKeyDownInner(event) {
    const { isOpen, isMulti, setIsOpen, setValueBound, currentOptionIndex } = params;

    switch (event.keyCode) {
      case 9: // Tab
      case 27: // Esc
        setIsOpen(false);
        break;
      case 13: // Enter
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 32: // Space
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(!isOpen);
        }
        break;
      case 38: // Up
        event.preventDefault();
        if (isMulti) {
          return false;
        }
        setIsOpen(true);
        setValueBound({ optionIndex: currentOptionIndex - 1 });
        break;
      case 40: // Down
        event.preventDefault();
        if (isMulti) {
          return false;
        }
        setIsOpen(true);
        setValueBound({ optionIndex: currentOptionIndex + 1 });
        break;
      case 8: // Backspace
        if (!isOpen && !isMulti) {
          event.preventDefault();

          setValueBound({ clear: true });
        }

        break;
      default:
        break;
    }
  };
}

function handleOutsideClick(params) {
  const { setIsOpen } = params;

  setIsOpen(false);
}

function getWrapperClassName({ config }: { config: TypeSelect }) {
  return cn({
    [styles.inputWrapper]: true,
    [styles.select]: true,
    [styles.focused]: config.isOpen,
    [styles.hasValue]: config.hasValue,
    [styles.hasErrors]: config.errors.length > 0,
    [styles.disabled]: config.disabled,
  });
}

function getSelectClassName(params) {
  return cn({
    [styles.selectBlock]: true,
    [styles.open]: params.isOpen,
    [styles.isMulti]: params.isMulti,
    [styles.openToTop]: params.openToTop,
    [styles.withSearch]: params.withSearch,
    [styles.isCreatable]: params.isCreatable,
  });
}

export const Select: React.FC<PropsSelect> = observer<PropsSelect>(props => {
  const { config } = props;

  const refs: SelectRefs = {
    selectRef: React.useRef(null),
    searchRef: React.useRef(null),
    scrollbarRef: React.useRef(null),
    selectListRef: React.useRef(null),
  };

  return (
    <div className={getWrapperClassName({ config })} ref={refs.selectRef}>
      <LabelConnected
        id={config.id}
        label={config.label}
        onClick={onSelectClick({ config, refs })}
        className={styles.labelPointer}
      />
      <Errors errors={config.errors} />
    </div>
  );

  const [openToTop, translateY] = useOpenToTop(params);
  params.openToTop = openToTop;
  params.translateY = translateY;

  useOnOpen(params);
  useScrollToCurrentOption(params);
  useClickOutside(params.selectRef, () => handleOutsideClick(params));
  useSetValidation(params);
  useDisabledChange(params);

  if (shouldNotRender(params)) {
    return null;
  }

  const searchInput = <SearchInputConnected {...params} forwardRef={params.searchRef} />;

  return (
    <div className={getWrapperClassName(params)} ref={params.selectRef}>
      <LabelConnected
        id={params.id}
        label={params.label}
        onClick={onSelectClick(params)}
        className={styles.labelPointer}
      />
      <div
        id={params.id}
        tabIndex={params.isMulti ? undefined : params.tabIndex}
        className={getSelectClassName(params)}
        onKeyDown={onWrapperKeyDown(params)}
      >
        <CurrentValue
          {...params}
          onClick={onSelectClick(params)}
          forwardRef={params.selectCurrentRef}
          searchInput={searchInput}
        />
        <div
          className={styles.list}
          ref={params.selectListRef}
          style={{
            transform: `translateY(${params.translateY}px)`,
          }}
        >
          <div className={styles.listInner}>
            {!params.isMulti && !params.isCreatable && searchInput}
            <OptionsConnected
              {...params}
              forwardRef={params.scrollbarRef}
              onOptionClick={onOptionClick(params)}
            />
          </div>
        </div>
      </div>
      <Errors errors={params.errors} />
    </div>
  );
});

// Select.propTypes = {
//   label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
//   isMulti: PropTypes.bool,
//   iconMode: PropTypes.bool,
//   disabled: PropTypes.bool,
//   tabIndex: PropTypes.number.isRequired,
//   className: PropTypes.string,
//   storePath: PropTypes.string.isRequired,
//   withSearch: PropTypes.bool,
//   isCreatable: PropTypes.bool,
//   optionsPath: PropTypes.string.isRequired,
//   showByStorePath: PropTypes.string,
// };
