import React, { useContext, useEffect, useState } from 'react';
import {
    createStore,
    applyMiddleware,
    StoreEnhancer,
    Store,
    CombinedState,
    AnyAction
} from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Route } from 'react-router-dom';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory, History } from 'history';
import MomentUtils from '@date-io/moment';
import { i18n } from 'i18next';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { sagas } from '../features/sagas';
import { IStoreState } from '../types';
import { createRootReducer } from '../features/rootReducer';
import { OriginConfigurationContext, initializeI18N } from './OriginConfigurationContext';
import { AppContainer } from './AppContainer';

export function Origin() {
    const originConfiguration = useContext(OriginConfigurationContext);
    const [store, setStore] = useState<Store<CombinedState<IStoreState>, AnyAction>>(null);
    const [history, setHistory] = useState<History>(null);
    const [i18next, seti18next] = useState<i18n>(null);

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

        const i18nInstance = initializeI18N(originConfiguration.language);
        seti18next(i18nInstance);
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
                        <Route path="/">
                            <AppContainer history={history} i18nInstance={i18next} />
                        </Route>
                    </ConnectedRouter>
                </Provider>
            </MuiPickersUtilsProvider>
        </MuiThemeProvider>
    );
}
