import { GridProps, ListItemProps, TabsProps } from '@material-ui/core';
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
  emptyListComponent?: ReactNode;
  actionsTabsProps?: TabsProps;
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
  allChecked: boolean;
  containersChecked: ContainerId[];
  itemsChecked: ItemId[];
};

type TDispatchCheckAll = { type: ActionsEnum.CHECK_ALL };
type TDispatchCheckContainer<ContainerId> = {
  type: ActionsEnum.CHECK_CONTAINER;
  payload: ContainerId;
};
type TDispatchCheckItem<ItemId> = {
  type: ActionsEnum.CHECK_ITEM;
  payload: ItemId[];
};
type TDispatchResetState = {
  type: ActionsEnum.RESET_STATE;
};
type ItemsListActionsType<ContainerId, ItemId> =
  | TDispatchCheckAll
  | TDispatchCheckContainer<ContainerId>
  | TDispatchCheckItem<ItemId>
  | TDispatchResetState;

export type TItemsListWithActionsReducer<ContainerId, ItemId> = (
  state: ItemsListWithActionsInitialState<ContainerId, ItemId>,
  action: ItemsListActionsType<ContainerId, ItemId>
) => ItemsListWithActionsInitialState<ContainerId, ItemId>;
// Reducer types
