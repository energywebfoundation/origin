/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';
import { MuiThemeProvider } from '@material-ui/core';
import {
    createOriginConfiguration,
    OriginConfigurationProvider
} from '../OriginConfigurationContext';
import { Exchange } from './Exchange';
import { setupStore, TEST_DEVICE_TYPES, TEST_REGIONS } from '../../__tests__/utils/helpers';
import { Provider } from 'react-redux';
import { configurationUpdated } from '../../features';
import { setOffchainConfiguration, setExchangeClient } from '../../features/general/actions';
import { DeviceTypeService, Configuration } from '@energyweb/utils-general';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { setUserOffchain } from '../../features/users/actions';
import { IUser, IOriginConfiguration } from '@energyweb/origin-backend-core';
import { ExchangeClient, ExchangeClientMock } from '../../utils/exchange';

export default {
    title: 'Exchange',
    component: Exchange,
    decorators: [withKnobs]
};

const originConfiguration = createOriginConfiguration();

export const defaultView = () => {
    const { store } = setupStore(undefined, {
        mockUserFetcher: false,
        logActions: false,
        runSagas: false
    });

    store.dispatch(
        configurationUpdated(({
            deviceTypeService: new DeviceTypeService(TEST_DEVICE_TYPES)
        } as Partial<Configuration.Entity>) as Configuration.Entity)
    );

    store.dispatch(
        setOffchainConfiguration({
            configuration: ({ regions: TEST_REGIONS, countryName: 'Thailand' } as Partial<
                IOriginConfiguration
            >) as IOriginConfiguration
        })
    );
    store.dispatch(
        setUserOffchain(({
            id: number('userOffchain.id', 1)
        } as Partial<IUser>) as IUser)
    );
    store.dispatch(
        setExchangeClient({
            exchangeClient: boolean('useTextExchangeAPI', false)
                ? new ExchangeClient(text('exchangeURL', 'http://localhost:3033'))
                : ExchangeClientMock
        })
    );

    return (
        <OriginConfigurationProvider value={originConfiguration}>
            <MuiThemeProvider theme={originConfiguration.materialTheme}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Provider store={store}>
                        <Exchange currency={text('Currency', 'USD')} />
                    </Provider>
                </MuiPickersUtilsProvider>
            </MuiThemeProvider>
        </OriginConfigurationProvider>
    );
};
