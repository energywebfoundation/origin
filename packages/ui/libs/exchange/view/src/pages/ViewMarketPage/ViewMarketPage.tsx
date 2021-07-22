import { ListActionsBlock } from '@energyweb/origin-ui-core';
import { Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { MarketFilters } from '../../containers';
import { useViewMarketPageEffects } from './ViewMarketPage.effects';
import { useStyles } from './ViewMarketPage.styles';

export const ViewMarketPage: FC = () => {
  const classes = useStyles();
  const { state, dispatch, listActionsProps } = useViewMarketPageEffects();

  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" gutterBottom style={{ marginLeft: 10 }}>
        Market
      </Typography>

      <MarketFilters state={state} dispatch={dispatch} />

      <ListActionsBlock
        wrapperProps={{ className: classes.tabsWrapper }}
        {...listActionsProps}
      />
    </Paper>
  );
};
