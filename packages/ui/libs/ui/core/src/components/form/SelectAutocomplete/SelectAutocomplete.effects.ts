import { SyntheticEvent, useEffect, useState } from 'react';
import { GenericFormField } from '../../../containers';
import { FormSelectOption } from '../FormSelect';

export const useSelectAutocompleteEffects = <FormValuesType>(
  onChange: (...event: any[]) => void,
  dependentValue: FormSelectOption[],
  field: GenericFormField<FormValuesType>
) => {
  const [textValue, setTextValue] = useState<string>('');

  const changeHandler = (event: SyntheticEvent, value: any) => {
    const maxValues = field.multiple ? field.maxValues : 1;
    const slicedValues = value
      ? value.slice(0, maxValues ?? value.length)
      : value;

    onChange(slicedValues);

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
