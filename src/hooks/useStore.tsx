import React from 'react';
import { observable } from 'mobx';
import _ from 'lodash';

import { TypeSelect } from 'models';

class Store {
  @observable hooksSelectConfig: TypeSelect = {
    id: 'hooksSelect',
    value: ['One', 1],
    label: 'Hooks select',
    options: [
      ['One', 1],
      ['Two', 2],
      ['Three', 3],
      ['Four', 4],
    ],
    tabIndex: 1,
    isMulti: false,
    isOpen: false,
    disabled: false,
    withSearch: false,
    validation: [],
    isCreatable: false,
    firstRender: false,
    isVisible: true,
    searchValue: '',
    errors: [],

    get optionsFiltered() {
      return this.options.filter(([optionName]) =>
        optionName.toLowerCase().includes(this.searchValue.toLowerCase())
      );
    },
    get hasValue() {
      return this.value && this.value.length > 0;
    },
    get currentValue() {
      return this.isMulti || !this.hasValue ? null : this.value[1];
    },
    get currentOptionIndex() {
      return _.findIndex(this.optionsFiltered, option => option[1] === this.currentValue);
    },
  };
}

const store = new Store();

// setTimeout(() => {
//   store.hooksSelectConfig.value = ['Two', 2];
// }, 1000);

const storeContext = React.createContext(store);

export function useStore() {
  return React.useContext(storeContext);
}
