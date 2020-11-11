import React from 'react';
import { Orders, IOrdersProps } from './Orders';

export function Bids(props: IOrdersProps) {
    const { currency, data, title, highlightOrdersUserId } = props;

    return (
        <Orders
            data={data}
            currency={currency}
            title={title}
            highlightOrdersUserId={highlightOrdersUserId}
        />
    );
}
