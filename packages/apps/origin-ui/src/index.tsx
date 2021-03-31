import { render } from 'react-dom';
import React from 'react';
import './styles/app.scss';
import {
    initializeI18N,
    OriginConfigurationProvider,
    useConfigurationCreation
} from './components/OriginConfigurationContext';
import { createRootReducer } from './features/rootReducer';
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import logger from 'redux-logger';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import { AppContainer } from './components/AppContainer';
import { runSaga, setSagaRunner } from '@vmw/queue-for-redux-saga';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { sagas } from './features/sagas';

const originConfiguration = useConfigurationCreation();

const browserHistory = createBrowserHistory();
const IS_PRODUCTION = process.env.MODE === 'production';

const sagaMiddleware = createSagaMiddleware({
    context: originConfiguration
});

let store;

if (IS_PRODUCTION) {
    store = configureStore({
        devTools: false,
        middleware: [
            ...getDefaultMiddleware({
                thunk: false
            }),
            routerMiddleware(browserHistory),
            sagaMiddleware
        ],
        reducer: createRootReducer(browserHistory)
    });
} else {
    store = configureStore({
        devTools: true,
        // enhancers: [devToolsEnhancer({ trace: true, traceLimit: 50 })],
        middleware: [
            // ...getDefaultMiddleware({
            //     thunk: false
            //     // serializableCheck: true,
            //     // immutableCheck: true
            // }),
            routerMiddleware(browserHistory),
            sagaMiddleware,
            logger
        ],
        reducer: createRootReducer(browserHistory)
    });
}

setSagaRunner(sagaMiddleware);

setTimeout(() => {
    Object.values(sagas).forEach((saga) => runSaga(saga));
});

initializeI18N(originConfiguration.language);

render(
    <OriginConfigurationProvider value={originConfiguration}>
        <MuiThemeProvider theme={originConfiguration.materialTheme}>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={originConfiguration.language}>
                <Provider store={store}>
                    <ConnectedRouter history={browserHistory}>
                        <Route path="/">
                            <AppContainer history={browserHistory} />
                        </Route>
                    </ConnectedRouter>
                </Provider>
            </MuiPickersUtilsProvider>
        </MuiThemeProvider>
    </OriginConfigurationProvider>,
    document.getElementById('root')
);
