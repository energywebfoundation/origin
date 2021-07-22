import { useEffect, useReducer } from 'react';
import {
  ActionsEnum,
  initialState,
  reducer,
} from './ItemsListWithActions.reducer';
import {
  TItemsListWithActionsItem,
  TUseItemsListWithActionsEffects,
} from './ItemsListWithActions.types';

export const useItemsListWithActionsEffects: TUseItemsListWithActionsEffects =
  ({ containers }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const allSelected = state.allChecked;
    const containerIds = containers.keys();

    useEffect(() => {
      const checkedContainersLength = state.containersChecked.length;
      const isDifferentSize = checkedContainersLength !== containers.size;

      if (isDifferentSize && state.allChecked) {
        dispatch({ type: ActionsEnum.CHECK_ALL });
      } else if (!isDifferentSize && !state.allChecked) {
        dispatch({ type: ActionsEnum.CHECK_ALL });
      }
    }, [state.containersChecked]);

    const checkContainerHandler = <ContainerId>(id: ContainerId) => {
      const containerWasChecked = state.containersChecked.includes(id);
      const itemsState = [...state.itemsChecked];

      dispatch({
        type: ActionsEnum.CHECK_CONTAINER,
        payload: id,
      });

      const items = containers.get(id as any).items;
      const itemsIds = items.map((item) => item.id);
      const itemsStateWithoutThisContainer = itemsState.filter(
        (item) => !itemsIds.includes(item as any)
      );
      dispatch({
        type: ActionsEnum.CHECK_ITEM,
        payload: containerWasChecked
          ? itemsStateWithoutThisContainer
          : [...itemsStateWithoutThisContainer, ...itemsIds],
      });
    };

    const createCheckItemHandler = <ContainerId, ItemId>(
      containerId: ContainerId,
      items: TItemsListWithActionsItem<ItemId>[]
    ) => {
      const itemsIds = items.map((item) => item.id);

      return (id) => {
        const itemChecked = state.itemsChecked.includes(id);
        const stateWithThisItemChecked = [...state.itemsChecked, id];
        const stateWithoutThisItem = state.itemsChecked.filter(
          (item) => item !== id
        );

        dispatch({
          type: ActionsEnum.CHECK_ITEM,
          payload: itemChecked
            ? stateWithoutThisItem
            : stateWithThisItemChecked,
        });

        const parentChecked = state.containersChecked.includes(containerId);
        const allItemsFromContainerChecked = itemsIds.every((itemId) =>
          stateWithThisItemChecked.includes(itemId)
        );

        if (parentChecked) {
          dispatch({
            type: ActionsEnum.CHECK_CONTAINER,
            payload: containerId,
          });
        } else if (allItemsFromContainerChecked && !parentChecked) {
          dispatch({
            type: ActionsEnum.CHECK_CONTAINER,
            payload: containerId,
          });
        }
      };
    };

    const selectAllHandler = () => {
      for (const id of containerIds) {
        checkContainerHandler(id);
      }
    };

    const resetState = () => {
      dispatch({ type: ActionsEnum.RESET_STATE });
    };

    const listContainers = [];
    for (const [key, value] of containers) {
      listContainers.push({
        id: key,
        isChecked: state.containersChecked.includes(key),
        handleContainerCheck: checkContainerHandler,
        containerHeader: value.containerComponent,
        containerListItemProps: value.containerListItemProps,
        itemListItemProps: value.itemListItemProps,
        containerItems: value.items.map((item) => ({
          id: item.id,
          itemChecked: state.itemsChecked.includes(item.id),
          handleItemCheck: createCheckItemHandler(key, value.items),
          itemContent: item.component,
        })),
      });
    }

    return {
      allSelected,
      selectAllHandler,
      resetState,
      listContainers,
      selectedItems: state.itemsChecked,
    };
  };
