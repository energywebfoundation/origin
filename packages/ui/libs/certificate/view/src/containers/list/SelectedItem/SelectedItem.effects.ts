import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useSelectedItemEffects = <Id>(
  id: Id,
  onAmountChange: (id: Id, amount: string) => void
) => {
  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation();

  const openEditMode = () => {
    setEditMode(true);
  };

  const closeEditMode = () => {
    setEditMode(false);
  };

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
  };
};
