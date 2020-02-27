/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Orders } from './Orders';
import { withKnobs, text, object } from '@storybook/addon-knobs';
import { OrderBookOrderDTO } from '@energyweb/exchange-core';
import { MuiThemeProvider } from '@material-ui/core';
import { createOriginConfiguration } from '../OriginConfigurationContext';

export default {
    title: 'Orders',
    component: Orders,
    decorators: [withKnobs]
};

const DATA: OrderBookOrderDTO[] = [
    {
        price: 99,
        product: { deviceType: ['Solar'] },
        volume: '123456',
        userId: null
    },
    {
        price: 145,
        product: { deviceType: ['Solar'] },
        volume: '2000300',
        userId: '2'
    }
];

const originConfiguration = createOriginConfiguration();

const BidsComponent = () => (
    <Orders
        data={object('data', DATA)}
        currency={text('currency', '$')}
        title={text('title', 'Orders')}
        highlightOrdersUserId={text('highlightOrdersUserId', '2')}
    />
);

export const defaultView = () => (
    <MuiThemeProvider theme={originConfiguration.materialTheme}>
        <BidsComponent />
    </MuiThemeProvider>
);
