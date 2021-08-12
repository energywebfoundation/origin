import { DropResult } from 'react-beautiful-dnd';

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const [removed] = list.splice(startIndex, 1);
  list.splice(endIndex, 0, removed);
  return list;
};

export const useGenericCardsListEffects = <ItemType>(
  list?: ItemType[],
  handleDrag?: (newList: ItemType[]) => Promise<void>
) => {
  const onCardDragEnd = async (result: DropResult) => {
    if (!result.destination || !list || !handleDrag) return;
    const reorderedList = reorder(
      list,
      result.source.index,
      result.destination.index
    );
    await handleDrag(reorderedList);
  };
  return { onCardDragEnd };
};
