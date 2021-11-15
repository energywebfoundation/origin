import {
  ItemsListWithActionsInitialState,
  TItemsListWithActionsReducer,
} from './ItemsListWithActions.types';

export enum ActionsEnum {
  CHECK_CONTAINER_OR_ITEM = 'CHECK_CONTAINER_OR_ITEM',
  RESET_STATE = 'RESET_STATE',
}

export const initialState: ItemsListWithActionsInitialState<any, any> = {
  containersChecked: [],
  itemsChecked: [],
};

export const reducer: TItemsListWithActionsReducer<any, any> = (
  state,
  action
) => {
  switch (action.type) {
    case ActionsEnum.CHECK_CONTAINER_OR_ITEM:
      return {
        ...state,
        containersChecked: action.payload.containers,
        itemsChecked: action.payload.items,
      };

    case ActionsEnum.RESET_STATE:
      return initialState;
  }
};
