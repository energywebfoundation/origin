import { SyntheticEvent, useState } from 'react';
import { FormSelectOption } from '../FormSelect';

export const useSelectAutocompleteEffects = (
  onChange: (...event: any[]) => void,
  maxValues: number
) => {
  const [touchFlag, setTouchFlag] = useState<boolean>(null);
  const [textValue, setTextValue] = useState<string>('');

  const singleChangeHandler = (
    event: SyntheticEvent,
    value: FormSelectOption
  ) => {
    onChange(value?.value ?? null);
    setTouchFlag(true);
    setTextValue(value?.label ?? '');
  };

  const multipleChangeHandler = (
    event: SyntheticEvent,
    value: FormSelectOption[]
  ) => {
    onChange(value ? value.slice(0, maxValues ?? value.length) : value);
    setTouchFlag(true);
    setTextValue('');
  };

  return {
    textValue,
    touchFlag,
    setTextValue,
    singleChangeHandler,
    multipleChangeHandler,
  };
};
