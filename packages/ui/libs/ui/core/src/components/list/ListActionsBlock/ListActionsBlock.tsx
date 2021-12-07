import { Tabs, Tab, TabsProps } from '@mui/material';
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

export type ListAction<ItemId = any> = {
  name: string;
  content?: ReactNode;
  component?: React.FC<ListActionComponentProps<ItemId>>;
};

export type ListActionsBlockProps<ItemId = any> = {
  actions: ListAction<ItemId>[];
  selectedIds?: ItemId[];
  resetSelected?: () => void;
  tabsProps?: TabsProps;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  selectedTab?: number;
  setSelectedTab?: (value: number) => void;
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
  selectedTab,
  setSelectedTab,
}) => {
  const { selected, setSelected, resetList } = useListActionsBlockEffects(
    selectedTab,
    setSelectedTab,
    resetSelected
  );

  if (!actions[selected]) return null;

  const { content, component: Component } = actions[selected];
  return (
    <div {...wrapperProps}>
      {actions.length >= 2 && (
        <Tabs
          value={selected}
          onChange={(event: any, index: number) => {
            setSelected(index);
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
        <Component selectedIds={selectedIds} resetIds={resetList} />
      )}
    </div>
  );
};
