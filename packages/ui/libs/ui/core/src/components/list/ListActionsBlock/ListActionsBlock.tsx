import { Tabs, Tab, TabsProps } from '@material-ui/core';
import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react';
import { useListActionsBlockEffects } from './ListActionsBlock.effects';

export type ListActionComponentProps<ItemId> = {
  selectedIds: ItemId[];
  resetIds?: () => void;
};

export type ListAction<ItemId = {}> = {
  name: string;
  content?: ReactNode;
  component?: React.FC<ListActionComponentProps<ItemId>>;
};

export type ListActionsBlockProps<ItemId = {}> = {
  actions: ListAction<ItemId>[];
  selectedIds?: ItemId[];
  resetSelected?: () => void;
  tabsProps?: TabsProps;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
};

export type TListActionsBlock = <ItemId>(
  props: PropsWithChildren<ListActionsBlockProps<ItemId>>
) => ReactElement;

export const ListActionsBlock: TListActionsBlock = ({
  actions,
  selectedIds,
  resetSelected,
  tabsProps,
  wrapperProps,
}) => {
  const { tabIndex, setTabIndex } = useListActionsBlockEffects();

  if (!actions[tabIndex]) {
    return <></>;
  }

  const { content, component: Component } = actions[tabIndex];
  return (
    <div {...wrapperProps}>
      {actions.length > 2 && (
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
      )}
      {content ? (
        content
      ) : (
        <Component selectedIds={selectedIds} resetIds={resetSelected} />
      )}
    </div>
  );
};
