import { ChangeEvent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useSelectedItemEffects = <Id>(
  id: Id,
  amount: string,
  onAmountChange: (id: Id, amount: string) => void,
  editMode: boolean,
  setEditMode: (newValue: boolean) => void
) => {
  const [inputValue, setInputValue] = useState(amount);
  const { t } = useTranslation();

  const openEditMode = () => {
    setEditMode(true);
  };

  const closeEditMode = () => {
    setEditMode(false);
  };

  useEffect(() => {
    if (amount !== inputValue) {
      setInputValue(amount);
    }
  }, [amount]);

  const handleInputChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setInputValue(event.target.value);
  };

  const handleSave = () => {
    onAmountChange(id, inputValue);
    closeEditMode();
  };

  const saveText = t('general.buttons.save');
  const cancelText = t('general.buttons.cancel');
  const editInputLabel = t('general.input.editAmount');

  const buttonDisabled =
    inputValue === amount ||
    isNaN(Number(inputValue)) ||
    !inputValue ||
    Number(inputValue) < 1 ||
    Number(inputValue) > Number(amount);

  return {
    editMode,
    inputValue,
    handleInputChange,
    openEditMode,
    closeEditMode,
    handleSave,
    saveText,
    cancelText,
    editInputLabel,
    buttonDisabled,
  };
};
