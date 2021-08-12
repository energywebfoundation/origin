import { useState } from 'react';
import { CardsListItem } from '../../components/list';

export const useCardsListBlockEffects = <Id>(allItems: CardsListItem<Id>[]) => {
  const [checkedIds, setCheckedIds] = useState<Id[]>([]);

  const handleCheck = (id: Id) => {
    if (checkedIds.includes(id)) {
      const newChecked = [...checkedIds].filter(
        (checkedId) => checkedId !== id
      );
      return setCheckedIds(newChecked);
    }
    const newChecked = [...checkedIds, id];
    setCheckedIds(newChecked);
  };

  const allChecked = checkedIds.length === allItems.length;

  const handleAllCheck = () => {
    if (allChecked) {
      return setCheckedIds([]);
    }
    const newChecked = allItems.map((item) => item.id);
    setCheckedIds(newChecked);
  };

  return { handleCheck, checkedIds, allChecked, handleAllCheck };
};
