import React, { FC } from 'react';
import { ListActionsBlock } from '@energyweb/origin-ui-core';
import { Box, Paper, Typography } from '@material-ui/core';
import { MarketFilters } from '../../containers';
import { useViewMarketPageEffects } from './ViewMarketPage.effects';
import { useStyles } from './ViewMarketPage.styles';

export const ViewMarketPage: FC = () => {
  const classes = useStyles();
  const {
    state,
    dispatch,
    formActionsProps,
    formTitle,
    tablesActionsProps,
    isLoading,
  } = useViewMarketPageEffects();

  if (isLoading) return null;

  return (
    <Box width="100%" mr={3}>
      <Paper className={classes.paper}>
        <Paper className={classes.filtersPaper}>
          <Typography variant="h5" gutterBottom style={{ marginLeft: 10 }}>
            {formTitle}
          </Typography>
          <MarketFilters state={state} dispatch={dispatch} />
        </Paper>

        <Paper className={classes.tabsPaper}>
          <ListActionsBlock
            tabsProps={{
              variant: 'fullWidth',
              className: classes.tabs,
              classes: {
                scroller: classes.scroller,
              },
            }}
            {...formActionsProps}
          />
        </Paper>
      </Paper>
      <Paper className={classes.tabsPaper}>
        <ListActionsBlock
          tabsProps={{
            variant: 'fullWidth',
            className: classes.tabs,
            classes: {
              scroller: classes.scroller,
            },
          }}
          {...tablesActionsProps}
        />
      </Paper>
    </Box>
  );
};
