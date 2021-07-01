import { Tabs, Tab, TabsProps } from '@material-ui/core';
import React, { DetailedHTMLProps, FC, HTMLAttributes, ReactNode } from 'react';
import { useListActionsBlockEffects } from './ListActionsBlock.effects';

export type ListAction = {
  name: string;
  content: ReactNode;
};

export interface ListActionsBlockProps {
  actions: ListAction[];
  tabsProps?: TabsProps;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const ListActionsBlock: FC<ListActionsBlockProps> = ({
  actions,
  tabsProps,
  wrapperProps,
}) => {
  const { tabIndex, setTabIndex } = useListActionsBlockEffects();
  return (
    <div {...wrapperProps}>
      <Tabs
        value={tabIndex}
        onChange={(ev, index) => {
          setTabIndex(index);
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        {...tabsProps}
      >
        {actions.map((action) => (
          <Tab key={action.name} label={action.name} />
        ))}
      </Tabs>
      {actions[tabIndex].content}
    </div>
  );
};
