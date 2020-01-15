import React, { useContext } from 'react';
import { Route } from 'react-router-dom';
import { AppContainer } from './AppContainer';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, StoreEnhancer } from 'redux';
import { createRootReducer } from '../reducers';
import createSagaMiddleware from 'redux-saga';
import { sagas } from '../features/sagas';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createBrowserHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { OriginConfigurationContext } from './OriginConfigurationContext';

const history = createBrowserHistory();

const IS_PRODUCTION = process.env.MODE === 'production';

let middleware: StoreEnhancer;

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

export function Origin() {
    const originConfiguration = useContext(OriginConfigurationContext);

    if (!originConfiguration) {
        throw new Error(
            '<Origin> component has to be wrapped in <OriginConfigurationProvider value={createOriginConfiguration()}>'
        );
    }

    return (
        <MuiThemeProvider theme={originConfiguration.materialTheme}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <Route path="/" component={AppContainer} />
                    </ConnectedRouter>
                </Provider>
            </MuiPickersUtilsProvider>
        </MuiThemeProvider>
    );
}
