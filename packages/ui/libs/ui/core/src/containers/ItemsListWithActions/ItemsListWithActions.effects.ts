import { useReducer } from 'react';
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
    const allSelected = containers.size === state.containersChecked.length;

    const checkContainerHandler = <ContainerId>(id: ContainerId) => {
      const containerWasChecked = state.containersChecked.includes(id);
      const itemsState = [...state.itemsChecked];

      const items = containers.get(id as any).items;
      const itemsIds = items.map((item) => item.id);
      const itemsStateWithoutThisContainer = itemsState.filter(
        (item) => !itemsIds.includes(item as any)
      );
      const itemsStateWithThisContainer = [
        ...itemsStateWithoutThisContainer,
        ...itemsIds,
      ];

      dispatch({
        type: ActionsEnum.CHECK_CONTAINER_OR_ITEM,
        payload: {
          containers: containerWasChecked
            ? state.containersChecked.filter(
                (containerId) => containerId !== id
              )
            : [...state.containersChecked, id],
          items: containerWasChecked
            ? itemsStateWithoutThisContainer
            : itemsStateWithThisContainer,
        },
      });
    };

    const createCheckItemHandler = <ContainerId, ItemId>(
      containerId: ContainerId,
      items: TItemsListWithActionsItem<ItemId>[]
    ) => {
      const itemsIds = items.map((item) => item.id);

      return (id: ItemId) => {
        const itemChecked = state.itemsChecked.includes(id);
        const stateWithThisItemChecked = [...state.itemsChecked, id];
        const stateWithoutThisItem = state.itemsChecked.filter(
          (item) => item !== id
        );

        const parentChecked = state.containersChecked.includes(containerId);
        const allItemsFromContainerChecked = itemsIds.every((itemId) =>
          stateWithThisItemChecked.includes(itemId)
        );

        dispatch({
          type: ActionsEnum.CHECK_CONTAINER_OR_ITEM,
          payload: {
            containers: parentChecked
              ? state.containersChecked.filter(
                  (stateId) => stateId !== containerId
                )
              : allItemsFromContainerChecked
              ? [...state.containersChecked, containerId]
              : state.containersChecked,
            items: itemChecked
              ? stateWithoutThisItem
              : stateWithThisItemChecked,
          },
        });
      };
    };

    const resetState = () => {
      dispatch({ type: ActionsEnum.RESET_STATE });
    };

    const selectAllHandler = () => {
      if (allSelected) {
        resetState();
      } else {
        const containersKeys = containers.keys();
        const containersIds = Array.from(containersKeys);
        const itemsIds = containersIds.flatMap((id) => {
          const currentContainerItems = containers.get(id);
          const currentContainerItemIds = currentContainerItems?.items?.map(
            (item) => item.id
          );
          if (currentContainerItemIds) {
            return currentContainerItemIds;
          }
        });

        dispatch({
          type: ActionsEnum.CHECK_CONTAINER_OR_ITEM,
          payload: {
            containers: containersIds,
            items: itemsIds,
          },
        });
      }
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
