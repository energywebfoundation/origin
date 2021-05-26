import { useEffect, useReducer } from 'react';
import {
  ActionsEnum,
  initialState,
  reducer,
} from './ItemsListWithActions.reducer';
import { TUseItemsListWithActionsEffects } from './ItemsListWithActions.types';
import { pick, pickBy } from 'lodash';

export const useItemsListWithActionsEffects: TUseItemsListWithActionsEffects = ({
  content,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const allSelected: boolean = state.allChecked;
  const containerIds = content.keys();

  const selectAllHandler = () => {
    dispatch({ type: ActionsEnum.CHECK_ALL });

    for (const id of containerIds) {
      dispatch({
        type: ActionsEnum.CHECK_CONTAINER,
        payload: { key: String(id), value: !state.allChecked },
      });
      const items = content.get(id).items;
      items.forEach((item) =>
        dispatch({
          type: ActionsEnum.CHECK_ITEM,
          payload: { key: String(item.id), value: !state.allChecked },
        })
      );
    }
  };

  useEffect(() => {
    const checkedContainers = pickBy(state.containersChecked, (value) => {
      return value === true;
    });
    const checkedContainersLength = Object.keys(checkedContainers).length;
    const isDifferentSize = checkedContainersLength !== content.size;

    if (isDifferentSize && state.allChecked) {
      dispatch({ type: ActionsEnum.CHECK_ALL });
    } else if (!isDifferentSize && !state.allChecked) {
      dispatch({ type: ActionsEnum.CHECK_ALL });
    }
  }, [state.containersChecked]);

  const checkContainerHandler = (id: any) => {
    const containerIdString = String(id);

    dispatch({
      type: ActionsEnum.CHECK_CONTAINER,
      payload: {
        key: containerIdString,
        value: !state.containersChecked[containerIdString],
      },
    });
    const items = content.get(id).items;
    items.forEach((item) =>
      dispatch({
        type: ActionsEnum.CHECK_ITEM,
        payload: {
          key: String(item.id),
          value: !state.containersChecked[containerIdString],
        },
      })
    );
  };

  const createCheckItemHandler = (containerId: any, items: any[]) => {
    const containerIdString = String(containerId);
    const itemsIds = items.map((item) => item.id);

    return (id) => {
      dispatch({
        type: ActionsEnum.CHECK_ITEM,
        payload: { key: String(id), value: !state.itemsChecked[String(id)] },
      });

      const parentContainerState = state.containersChecked[containerIdString];

      const theseItemsState = pick(state.itemsChecked, [...itemsIds]);
      theseItemsState[String(id)] = !state.itemsChecked[String(id)];
      const onlyCheckedItems = pickBy(
        theseItemsState,
        (value) => value === true
      );
      const allItemsInContainerAreSelected =
        Object.keys(onlyCheckedItems).length === items.length;

      if (parentContainerState) {
        dispatch({
          type: ActionsEnum.CHECK_CONTAINER,
          payload: {
            key: containerIdString,
            value: !parentContainerState,
          },
        });
      } else if (allItemsInContainerAreSelected && !parentContainerState) {
        dispatch({
          type: ActionsEnum.CHECK_CONTAINER,
          payload: {
            key: containerIdString,
            value: !parentContainerState,
          },
        });
      }
    };
  };

  const listContainers = [];
  for (const [key, value] of content) {
    listContainers.push({
      id: key,
      isChecked: !!state.containersChecked[String(key)],
      handleContainerCheck: checkContainerHandler,
      containerHeader: value.containerComponent,
      containerItems: value.items.map((item) => ({
        id: item.id,
        itemChecked: !!state.itemsChecked[String(item.id)],
        handleItemCheck: createCheckItemHandler(key, value.items),
        itemContent: item.component,
      })),
    });
  }

  const listProps = {
    allSelected,
    selectAllHandler,
    listContainers,
  };

  return listProps;
};
