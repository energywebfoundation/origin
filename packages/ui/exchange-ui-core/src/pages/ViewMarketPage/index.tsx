import React, { ReactElement } from 'react';
import { Grid } from '@material-ui/core';
import { EnergyFormatter, TableFallback, useUserInfo } from '@energyweb/origin-ui-core';
import { Asks, Bids, Market } from '../../components';
import { Skeleton } from '@material-ui/lab';
import { useViewMarketPageEffects } from './hooks/useViewMarketPageEffects';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';

export const ViewMarketPage = (): ReactElement => {
    const { t } = useTranslation();

    const { user } = useUserInfo();

    const {
        buyDirect,
        marketValuesChangeHandler,
        bidHandler,
        totalOrders,
        currency,
        exchangeAddress,
        configuration,
        orderbookData
    } = useViewMarketPageEffects();

    return (
        <div>
            <Grid container>
                <Grid item xs={9}>
                    {!configuration?.deviceTypeService?.deviceTypes ? (
                        <Skeleton variant="rect" height={200} />
                    ) : (
                        <Market
                            onBid={bidHandler}
                            onChange={(values) => marketValuesChangeHandler(values)}
                            energyUnit={EnergyFormatter.displayUnit}
                            currency={currency}
                            disableBidding={isEmpty(user) || isEmpty(exchangeAddress)}
                        />
                    )}
                    <br />
                    <br />
                </Grid>
                <Grid item xs={3} />
                <Grid container>
                    <Grid item xs={9}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                {!configuration?.deviceTypeService?.deviceTypes ? (
                                    <TableFallback />
                                ) : (
                                    <Asks
                                        data={orderbookData.asks}
                                        currency={currency}
                                        title={t('exchange.info.asks')}
                                        highlightOrdersUserId={user?.id?.toString()}
                                        displayAssetDetails={true}
                                        buyDirect={buyDirect}
                                        energyUnit={EnergyFormatter.displayUnit}
                                        ordersTotalVolume={totalOrders?.totalAsks}
                                        directBuydisabled={!exchangeAddress}
                                    />
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                {!configuration?.deviceTypeService?.deviceTypes ? (
                                    <TableFallback />
                                ) : (
                                    <Bids
                                        data={orderbookData.bids}
                                        currency={currency}
                                        title={t('exchange.info.bids')}
                                        highlightOrdersUserId={user?.id?.toString()}
                                        ordersTotalVolume={totalOrders?.totalBids}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3} />
                </Grid>
            </Grid>
        </div>
    );
};

ViewMarketPage.displayName = 'ViewMarketPage';
