import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import {
  GridProps,
  ListItemProps,
  PaginationProps,
  TabsProps,
  TypographyProps,
} from '@mui/material';
import { GenericItemsListProps, ListAction } from '../../components/list';
import { ActionsEnum } from './ItemsListWithActions.reducer';

// Component types
export type TItemsListWithActionsItem<Id> = {
  id: Id;
  component: ReactNode;
};
export type TItemsListWithActionsContainers<ContainerId, ItemId> = Map<
  ContainerId,
  {
    containerComponent: ReactNode;
    items: TItemsListWithActionsItem<ItemId>[];
    containerListItemProps?: ListItemProps;
    itemListItemProps?: ListItemProps;
  }
>;

export interface ItemsListWithActionsProps<ContainerId, ItemId> {
  containers: TItemsListWithActionsContainers<ContainerId, ItemId>;
  actions: ListAction<ItemId>[];
  listTitle?: string;
  listTitleProps?: TypographyProps;
  selectAllText?: string;
  checkboxes?: boolean;
  pagination?: boolean;
  pageSize?: number;
  paginationProps?: PaginationProps;
  itemsGridProps?: GridProps;
  actionsGridProps?: GridProps;
  emptyListComponent?: ReactNode;
  actionsTabsProps?: TabsProps;
  disabled?: boolean;
}

export type TItemsListWithActions = <ContainerId, ItemId>(
  props: PropsWithChildren<ItemsListWithActionsProps<ContainerId, ItemId>>
) => ReactElement;
// Component types

// Effects types
type UseItemsListWithActionsEffectsArgs<ContainerId, ItemId> = {
  containers: TItemsListWithActionsContainers<ContainerId, ItemId>;
};

type UseItemsListWithActionsEffectsReturnType<ContainerId, ItemId> = Omit<
  GenericItemsListProps<ContainerId, ItemId>,
  'listTitle' | 'selectAllText'
> & {
  selectedItems: ItemId[];
  resetState: () => void;
};

export type TUseItemsListWithActionsEffects = <ContainerId, ItemId>(
  props: UseItemsListWithActionsEffectsArgs<ContainerId, ItemId>
) => UseItemsListWithActionsEffectsReturnType<ContainerId, ItemId>;
// Effects types

// Reducer types
export type ItemsListWithActionsInitialState<ContainerId, ItemId> = {
  containersChecked: ContainerId[];
  itemsChecked: ItemId[];
};

type TDispatchCheckContainerOrItem<ContainerId, ItemId> = {
  type: ActionsEnum.CHECK_CONTAINER_OR_ITEM;
  payload: {
    containers: ContainerId[];
    items: ItemId[];
  };
};
type TDispatchResetState = {
  type: ActionsEnum.RESET_STATE;
};
type ItemsListActionsType<ContainerId, ItemId> =
  | TDispatchCheckContainerOrItem<ContainerId, ItemId>
  | TDispatchResetState;

export type TItemsListWithActionsReducer<ContainerId, ItemId> = (
  state: ItemsListWithActionsInitialState<ContainerId, ItemId>,
  action: ItemsListActionsType<ContainerId, ItemId>
) => ItemsListWithActionsInitialState<ContainerId, ItemId>;
// Reducer types
