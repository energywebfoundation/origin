import React, { useContext, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { AppContainer } from './AppContainer';
import { Provider } from 'react-redux';
import {
    createStore,
    applyMiddleware,
    StoreEnhancer,
    Store,
    CombinedState,
    AnyAction
} from 'redux';
import { createRootReducer } from '../reducers';
import createSagaMiddleware from 'redux-saga';
import { sagas } from '../features/sagas';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createBrowserHistory, History } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { OriginConfigurationContext, initializeI18N } from './OriginConfigurationContext';
import { IStoreState } from '../types';

export function Origin() {
    const originConfiguration = useContext(OriginConfigurationContext);
    const [store, setStore] = useState<Store<CombinedState<IStoreState>, AnyAction>>(null);
    const [history, setHistory] = useState<History>(null);

    useEffect(() => {
        if (store) {
            return;
        }

        const newHistory = createBrowserHistory();

        const IS_PRODUCTION = process.env.MODE === 'production';

        let middleware: StoreEnhancer;

        const sagaMiddleware = createSagaMiddleware({
            context: originConfiguration
        });

        if (IS_PRODUCTION) {
            middleware = applyMiddleware(routerMiddleware(newHistory), sagaMiddleware);
        } else {
            middleware = composeWithDevTools({ trace: true, traceLimit: 50 })(
                applyMiddleware(routerMiddleware(newHistory), sagaMiddleware)
            );
        }

        setHistory(newHistory);
        setStore(createStore(createRootReducer(newHistory), middleware));

        Object.keys(sagas).forEach((saga: keyof typeof sagas) => {
            sagaMiddleware.run(sagas[saga]);
        });

        initializeI18N(originConfiguration.language);
    });

    if (!originConfiguration) {
        throw new Error(
            '<Origin> component has to be wrapped in <OriginConfigurationProvider value={createOriginConfiguration()}>'
        );
    }

    if (!store) {
        return <></>;
    }

    return (
        <MuiThemeProvider theme={originConfiguration.materialTheme}>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={originConfiguration.language}>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <Route path="/" component={AppContainer} />
                    </ConnectedRouter>
                </Provider>
            </MuiPickersUtilsProvider>
        </MuiThemeProvider>
    );
}
