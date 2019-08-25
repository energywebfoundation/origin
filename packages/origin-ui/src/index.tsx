// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';
import { AppContainer } from './components/AppContainer';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createRootReducer } from './reducers';
import './index.scss';
import createSagaMiddleware from 'redux-saga';
import sagas from './features/sagas';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { DEFAULT_MATERIAL_THEME } from './styles/styleConfig';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';

const history = createBrowserHistory();

const IS_PRODUCTION = process.env.MODE === 'production';

let middleware;

const sagaMiddleware = createSagaMiddleware();

if (IS_PRODUCTION) {
    middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware);
} else {
    middleware = composeWithDevTools(applyMiddleware(routerMiddleware(history), sagaMiddleware));
}

const store = createStore(createRootReducer(history), middleware);

Object.keys(sagas).forEach((saga: keyof typeof sagas) => {
    sagaMiddleware.run(sagas[saga]);
});

ReactDOM.render(
    <MuiThemeProvider theme={DEFAULT_MATERIAL_THEME()}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Route path="/:contractAddress?" component={AppContainer} />
                </ConnectedRouter>
            </Provider>
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>,
    document.getElementById('root')
);
