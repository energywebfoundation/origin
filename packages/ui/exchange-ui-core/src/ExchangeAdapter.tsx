import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import { I18nextProvider } from 'react-i18next';
import { i18n } from 'i18next';
import { OriginConfigurationProvider, IOriginConfiguration } from '@energyweb/origin-ui-core';
import { Store, CombinedState, AnyAction } from 'redux';
import { IExchangeState } from './types';

interface IProps {
    store: Store<CombinedState<IExchangeState>, AnyAction>;
    configuration: IOriginConfiguration;
    history: History;
    component: React.ReactElement;
    i18nInstance: i18n;
}

export function ExchangeAdapter(props: IProps) {
    return (
        <>
            {props.store && props.configuration ? (
                <OriginConfigurationProvider value={props.configuration}>
                    <MuiThemeProvider theme={props.configuration.materialTheme}>
                        <MuiPickersUtilsProvider
                            utils={MomentUtils}
                            locale={props.configuration.language}
                        >
                            <Provider store={props.store}>
                                <ConnectedRouter history={props.history}>
                                    <I18nextProvider i18n={props.i18nInstance}>
                                        {props.component}
                                    </I18nextProvider>
                                </ConnectedRouter>
                            </Provider>
                        </MuiPickersUtilsProvider>
                    </MuiThemeProvider>
                </OriginConfigurationProvider>
            ) : null}
        </>
    );
}
