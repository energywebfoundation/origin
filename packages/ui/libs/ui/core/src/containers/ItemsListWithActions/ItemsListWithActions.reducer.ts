import {
  ItemsListWithActionsInitialState,
  TItemsListWithActionsReducer,
} from './ItemsListWithActions.types';

export enum ActionsEnum {
  CHECK_ALL = 'SET_ALL_CHECKED',
  CHECK_CONTAINER = 'SET_CONTAINER_CHECKED',
  CHECK_ITEM = 'CHECK_ITEM',
  RESET_STATE = 'RESET_STATE',
}

export const initialState: ItemsListWithActionsInitialState<any, any> = {
  allChecked: false,
  containersChecked: [],
  itemsChecked: [],
};

export const reducer: TItemsListWithActionsReducer<any, any> = (
  state,
  action
) => {
  switch (action.type) {
    case ActionsEnum.CHECK_ALL:
      return { ...state, allChecked: !state.allChecked };

    case ActionsEnum.CHECK_CONTAINER:
      if (state.containersChecked.includes(action.payload)) {
        const newState = [...state.containersChecked].filter(
          (containerId) => containerId !== action.payload
        );
        return { ...state, containersChecked: newState };
      }
      return {
        ...state,
        containersChecked: [...state.containersChecked, action.payload],
      };

    case ActionsEnum.CHECK_ITEM:
      return {
        ...state,
        itemsChecked: action.payload,
      };

    case ActionsEnum.RESET_STATE:
      return initialState;
  }
};
