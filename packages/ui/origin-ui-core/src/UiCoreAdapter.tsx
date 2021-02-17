import React from 'react';
import { Store, CombinedState, AnyAction } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import { MuiThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {
    OriginConfigurationProvider,
    IOriginConfiguration
} from './components/PackageConfigurationProvider';
import { ICoreState } from './types';

interface IProps {
    store: Store<CombinedState<ICoreState>, AnyAction>;
    configuration: IOriginConfiguration;
    history: History;
    component: React.ReactElement;
}

export function UiCoreAdapter(props: IProps) {
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
                                    {props.component}
                                </ConnectedRouter>
                            </Provider>
                        </MuiPickersUtilsProvider>
                    </MuiThemeProvider>
                </OriginConfigurationProvider>
            ) : null}
        </>
    );
}
