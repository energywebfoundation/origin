import React, { ReactElement } from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { usePermissions, Requirements } from '@energyweb/origin-ui-core';
import { Trades } from '../../components';
import { useMyTradesPageEffects } from './hooks/useMyTradesPageEffects';

export const MyTradesPage = (): ReactElement => {
    const { t } = useTranslation();
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }

    const { currency, tradeData } = useMyTradesPageEffects();

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Trades
                        currency={currency}
                        data={tradeData}
                        title={t('exchange.info.myTrades')}
                    />
                </Grid>
            </Grid>
        </div>
    );
};
