import { GridProps, ListItemProps } from '@material-ui/core';
import { PropsWithChildren, ReactElement, ReactNode } from 'react';
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
  actions: ListAction[];
  listTitle?: string;
  listTitleProps?: GenericItemsListProps<ContainerId, ItemId>['titleProps'];
  selectAllText?: string;
  checkboxes?: GenericItemsListProps<ContainerId, ItemId>['checkboxes'];
  pagination?: GenericItemsListProps<ContainerId, ItemId>['pagination'];
  pageSize?: GenericItemsListProps<ContainerId, ItemId>['pageSize'];
  paginationProps?: GenericItemsListProps<
    ContainerId,
    ItemId
  >['paginationProps'];
  itemsGridProps?: GridProps;
  actionsGridProps?: GridProps;
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
>;

export type TUseItemsListWithActionsEffects = <ContainerId, ItemId>(
  props: UseItemsListWithActionsEffectsArgs<ContainerId, ItemId>
) => UseItemsListWithActionsEffectsReturnType<ContainerId, ItemId>;
// Effects types

// Reducer types
type CheckedObject = {
  [key: string]: boolean;
};
export type ItemsListWithActionsInitialState = {
  allChecked: boolean;
  containersChecked: CheckedObject;
  itemsChecked: CheckedObject;
};

type TDispatchCheckAll = { type: ActionsEnum.CHECK_ALL };
type TDispatchCheckContainer = {
  type: ActionsEnum.CHECK_CONTAINER;
  payload: { key: string; value: boolean };
};
type TDispatchCheckItem = {
  type: ActionsEnum.CHECK_ITEM;
  payload: { key: string; value: boolean };
};
type ItemsListActionsType =
  | TDispatchCheckAll
  | TDispatchCheckContainer
  | TDispatchCheckItem;

export type TItemsListWithActionsReducer<ContainerId, ItemId> = (
  state: ItemsListWithActionsInitialState,
  action: ItemsListActionsType
) => ItemsListWithActionsInitialState;
// Reducer types
