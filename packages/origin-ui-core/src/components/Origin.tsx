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
import i18n from 'i18next';
import ICU from 'i18next-icu';
import { EN, PL } from '@energyweb/localization';
import { initReactI18next } from 'react-i18next';
import { createBrowserHistory, History } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { OriginConfigurationContext } from './OriginConfigurationContext';
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

        const sagaMiddleware = createSagaMiddleware();

        if (IS_PRODUCTION) {
            middleware = applyMiddleware(routerMiddleware(newHistory), sagaMiddleware);
        } else {
            middleware = composeWithDevTools(
                applyMiddleware(routerMiddleware(newHistory), sagaMiddleware)
            );
        }

        setHistory(newHistory);
        setStore(createStore(createRootReducer(newHistory), middleware));

        Object.keys(sagas).forEach((saga: keyof typeof sagas) => {
            sagaMiddleware.run(sagas[saga]);
        });

        i18n.use(new ICU())
            .use(initReactI18next)
            .init({
                resources: {
                    en: EN,
                    pl: PL
                },
                lng: originConfiguration.language,
                fallbackLng: 'en',

                interpolation: {
                    escapeValue: false
                }
            });
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
