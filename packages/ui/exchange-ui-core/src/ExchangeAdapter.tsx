import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { Provider } from 'react-redux';
import { Store, CombinedState, AnyAction } from 'redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import {
    OriginConfigurationProvider,
    IOriginConfiguration,
    DeviceDataLayers
} from '@energyweb/origin-ui-core';
import { IExchangeState } from './types';
import { deviceDataLayerSelector, DataLayerContext } from './deviceDataLayer';

interface IProps {
    store: Store<CombinedState<IExchangeState>, AnyAction>;
    configuration: IOriginConfiguration;
    history: History;
    component: React.ReactElement;
    deviceDataLayer: DeviceDataLayers;
}

export function ExchangeAdapter(props: IProps) {
    const selectedDataLayer = deviceDataLayerSelector(props.deviceDataLayer);

    return (
        <>
            {props.store && props.configuration ? (
                <OriginConfigurationProvider value={props.configuration}>
                    <DataLayerContext.Provider value={selectedDataLayer}>
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
                    </DataLayerContext.Provider>
                </OriginConfigurationProvider>
            ) : null}
        </>
    );
}
