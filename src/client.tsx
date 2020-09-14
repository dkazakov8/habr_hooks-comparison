import './styles/global.scss';

import React from 'react';
import { hydrate } from 'react-dom';

import { isomorphPolyfills } from 'utils';
import { App } from 'components/App';

isomorphPolyfills();

hydrate(<App />, document.getElementById('app'));
