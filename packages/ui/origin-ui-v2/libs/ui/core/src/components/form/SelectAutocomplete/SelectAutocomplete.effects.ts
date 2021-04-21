import { SyntheticEvent, useState } from 'react';
import { FormSelectOption } from '../FormSelect';

export const useSelectAutocompleteEffects = (
  onChange: (...event: any[]) => void,
  maxValues: number
) => {
  const [textValue, setTextValue] = useState<string>('');

  const singleChangeHandler = (
    event: SyntheticEvent,
    value: FormSelectOption
  ) => {
    onChange(value?.value ?? null);
    setTextValue(value?.label ?? '');
  };

  const multipleChangeHandler = (
    event: SyntheticEvent,
    value: FormSelectOption[]
  ) => {
    onChange(value ? value.slice(0, maxValues ?? value.length) : value);
    setTextValue('');
  };

  return {
    textValue,
    setTextValue,
    singleChangeHandler,
    multipleChangeHandler,
  };
};
