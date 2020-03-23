/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { MuiThemeProvider } from '@material-ui/core';
import {
    createOriginConfiguration,
    OriginConfigurationProvider
} from '../OriginConfigurationContext';
import { Market } from './Market';
import { setupStore, TEST_DEVICE_TYPES, TEST_REGIONS } from '../../__tests__/utils/helpers';
import { Provider } from 'react-redux';
import { configurationUpdated } from '../../features';
import { setOffchainConfiguration } from '../../features/general/actions';
import { DeviceTypeService, Configuration } from '@energyweb/utils-general';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { action } from '@storybook/addon-actions';
import { IOriginConfiguration } from '@energyweb/origin-backend-core';

export default {
    title: 'Market',
    component: Market,
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
            configuration: ({ regions: TEST_REGIONS } as Partial<
                IOriginConfiguration
            >) as IOriginConfiguration
        })
    );

    return (
        <OriginConfigurationProvider value={originConfiguration}>
            <MuiThemeProvider theme={originConfiguration.materialTheme}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Provider store={store}>
                        <Market
                            onBid={action('onBid')}
                            onNotify={action('onNotify')}
                            onChange={action('onChange')}
                            energyUnit={text('energyUnit', 'MWh')}
                            currency={text('currency', '$')}
                        />
                    </Provider>
                </MuiPickersUtilsProvider>
            </MuiThemeProvider>
        </OriginConfigurationProvider>
    );
};
