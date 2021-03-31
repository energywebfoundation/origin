import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Orders, IOrdersProps } from './Orders';

export const Bids = memo((props: IOrdersProps) => {
    const { currency, data, title, highlightOrdersUserId, ordersTotalVolume } = props;
    const { t } = useTranslation();
    const popoverText = [
        t('exchange.popover.bidsDescription'),
        t('exchange.popover.bidsFurtherInstructions')
    ];

    return (
        <Orders
            data={data}
            currency={currency}
            title={title}
            highlightOrdersUserId={highlightOrdersUserId}
            ordersTotalVolume={ordersTotalVolume}
            popoverText={popoverText}
        />
    );
});

Bids.displayName = 'Bids';
