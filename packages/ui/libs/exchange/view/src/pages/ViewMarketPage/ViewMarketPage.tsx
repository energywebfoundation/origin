import { ListActionsBlock } from '@energyweb/origin-ui-core';
import { Box, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
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

  if (isLoading) return <></>;

  return (
    <Box width="100%" mr={3}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom style={{ marginLeft: 10 }}>
          {formTitle}
        </Typography>
        <MarketFilters state={state} dispatch={dispatch} />
        <ListActionsBlock
          wrapperProps={{ className: classes.tabsWrapper }}
          tabsProps={{ variant: 'fullWidth' }}
          {...formActionsProps}
        />
      </Paper>
      <ListActionsBlock
        tabsProps={{ variant: 'fullWidth' }}
        {...tablesActionsProps}
      />
    </Box>
  );
};
