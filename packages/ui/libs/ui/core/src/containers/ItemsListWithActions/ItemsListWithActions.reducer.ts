import {
  ItemsListWithActionsInitialState,
  TItemsListWithActionsReducer,
} from './ItemsListWithActions.types';

export enum ActionsEnum {
  CHECK_ALL = 'SET_ALL_CHECKED',
  CHECK_CONTAINER = 'SET_CONTAINER_CHECKED',
  CHECK_ITEM = 'CHECK_ITEM',
}

export const initialState: ItemsListWithActionsInitialState = {
  allChecked: false,
  containersChecked: {},
  itemsChecked: {},
};

export const reducer: TItemsListWithActionsReducer<unknown, unknown> = (
  state,
  action
) => {
  switch (action.type) {
    case ActionsEnum.CHECK_ALL:
      return { ...state, allChecked: !state.allChecked };

    case ActionsEnum.CHECK_CONTAINER:
      return {
        ...state,
        containersChecked: {
          ...state.containersChecked,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionsEnum.CHECK_ITEM:
      return {
        ...state,
        itemsChecked: {
          ...state.itemsChecked,
          [action.payload.key]: action.payload.value,
        },
      };
  }
};
