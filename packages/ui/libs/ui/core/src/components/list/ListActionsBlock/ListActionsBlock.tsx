import { Tabs, Tab, Paper } from '@material-ui/core';
import React, { FC } from 'react';
import { useListActionsBlockEffects } from './ListActionsBlock.effects';
import { useStyles } from './ListActionsBlock.styles';

export type ListAction = {
  name: string;
  content: FC;
};

export interface ListActionsBlockProps {
  actions: ListAction[];
}

export const ListActionsBlock: FC<ListActionsBlockProps> = ({ actions }) => {
  const { tabIndex, setTabIndex } = useListActionsBlockEffects();
  const classes = useStyles();
  return (
    <div>
      <Tabs
        value={tabIndex}
        onChange={(ev, index) => {
          setTabIndex(index);
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        {actions.map((action) => (
          <Tab key={action.name} label={action.name} />
        ))}
      </Tabs>
      <Paper className={classes.contentWrapper}>
        {actions[tabIndex].content}
      </Paper>
    </div>
  );
};
