import React from 'react';
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
import { getEnv } from './utils/helper';

const history = createBrowserHistory();

const IS_PRODUCTION = getEnv().MODE === 'production';

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
                    <Route path="/" component={AppContainer} />
                </ConnectedRouter>
            </Provider>
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>,
    document.getElementById('root')
);
