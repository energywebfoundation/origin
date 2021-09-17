import { IconPopover, IconSize } from '@energyweb/origin-ui-core';
import { Grid, Typography } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from './OrderBookTableHeader.styles';

interface OrderBookTableHeaderProps {
  title: string;
  ordersTotalVolume: number;
  currentOrders: number;
  popoverText: string[];
}

export const OrderBookTableHeader: FC<OrderBookTableHeaderProps> = ({
  title,
  ordersTotalVolume,
  currentOrders,
  popoverText,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Grid container alignItems="center" className={classes.container}>
      <Grid item xs={3}>
        <Typography variant="h5">{title}</Typography>
      </Grid>
      <Grid item xs={6}>
        {ordersTotalVolume > 0 ? (
          <Typography align="center">
            {currentOrders}
            {' / '}
            {ordersTotalVolume}
            {'  '}
            {t('exchange.viewMarket.matching')}
          </Typography>
        ) : null}
      </Grid>
      <Grid item xs={3}>
        <IconPopover
          clickable
          icon={Info}
          iconSize={IconSize.Small}
          popoverText={popoverText}
          className={classes.iconPopover}
        />
      </Grid>
    </Grid>
  );
};
