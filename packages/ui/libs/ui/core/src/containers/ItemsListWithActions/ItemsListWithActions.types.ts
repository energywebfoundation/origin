import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { GenericItemsListProps, ListAction } from '../../components/list';
import { ActionsEnum } from './ItemsListWithActions.reducer';

// Component types
export type TItemsListWithActionsItem<Id> = {
  id: Id;
  component: ReactNode;
};
export type TItemsListWithActionsContainer<ContainerId, ItemId> = Map<
  ContainerId,
  {
    containerComponent: ReactNode;
    items: TItemsListWithActionsItem<ItemId>[];
  }
>;

export interface ItemsListWithActionsProps<ContainerId, ItemId> {
  content: TItemsListWithActionsContainer<ContainerId, ItemId>;
  actions: ListAction[];
  listTitle?: string;
  selectAllText?: string;
}

export type TItemsListWithActions = <ContainerId, ItemId>(
  props: PropsWithChildren<ItemsListWithActionsProps<ContainerId, ItemId>>
) => ReactElement;
// Component types

// Effects types
type UseItemsListWithActionsEffectsArgs<ContainerId, ItemId> = {
  content: TItemsListWithActionsContainer<ContainerId, ItemId>;
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
