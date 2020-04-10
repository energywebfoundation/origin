/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Orders } from './Orders';
import { withKnobs, text, object } from '@storybook/addon-knobs';
import { MuiThemeProvider } from '@material-ui/core';
import { createOriginConfiguration } from '../OriginConfigurationContext';
import { IOrderBookOrderDTO } from '../../utils/exchange';

export default {
    title: 'Orders',
    component: Orders,
    decorators: [withKnobs]
};

const DATA: IOrderBookOrderDTO[] = ([
    {
        price: 99,
        volume: '123456'
    },
    {
        price: 145,
        volume: '2000300',
        userId: '2'
    }
] as Partial<IOrderBookOrderDTO[]>) as IOrderBookOrderDTO[];

const originConfiguration = createOriginConfiguration();

const OrderComponent = () => (
    <Orders
        data={object('data', DATA)}
        currency={text('currency', 'USD')}
        title={text('title', 'Orders')}
        highlightOrdersUserId={text('highlightOrdersUserId', '2')}
    />
);

export const defaultView = () => (
    <MuiThemeProvider theme={originConfiguration.materialTheme}>
        <OrderComponent />
    </MuiThemeProvider>
);
