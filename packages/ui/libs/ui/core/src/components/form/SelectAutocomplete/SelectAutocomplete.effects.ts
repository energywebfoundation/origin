import { SyntheticEvent, useEffect, useState } from 'react';
import { GenericFormField } from '../../../containers';
import { FormSelectOption } from '../FormSelect';

export const useSelectAutocompleteEffects = (
  onChange: (...event: any[]) => void,
  value: FormSelectOption[],
  dependentValue: FormSelectOption[],
  field: GenericFormField
) => {
  const [textValue, setTextValue] = useState<string>('');

  const changeHandler = (event: SyntheticEvent, value: FormSelectOption[]) => {
    const maxValues = field.multiple ? field.maxValues : 1;
    const slicedValues = value
      ? value.slice(0, maxValues ?? value.length)
      : value;

    onChange(slicedValues);

    if (!field.multiple) {
      return setTextValue(' ');
    }

    setTextValue('');
  };

  useEffect(() => {
    if (dependentValue?.length === 0) {
      setTextValue('');
      onChange([]);
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
    changeHandler,
  };
};
