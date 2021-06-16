import { SyntheticEvent, useEffect, useState } from 'react';
import { GenericFormField } from '../../../containers';
import { FormSelectOption } from '../FormSelect';

export const useSelectAutocompleteEffects = <ValueType>(
  onChange: (...event: any[]) => void,
  value: ValueType,
  dependentValue: ValueType,
  field: GenericFormField
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
    onChange(value ? value.slice(0, field.maxValues ?? value.length) : value);
    setTextValue('');
  };

  useEffect(() => {
    if (!!field.dependentOn && !!value) {
      setTextValue('');
      onChange(null);
    }
  }, [dependentValue]);

  const options =
    !!field.dependentOn && field.dependentOptionsCallback
      ? field.dependentOptionsCallback(dependentValue) || []
      : field.options;

  return {
    options,
    textValue,
    setTextValue,
    singleChangeHandler,
    multipleChangeHandler,
  };
};
