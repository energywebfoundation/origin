import React, { PropsWithChildren, ReactElement } from 'react';
import {
  Control,
  DeepMap,
  DeepPartial,
  FieldError,
  UnionLike,
  UseFormRegister,
} from 'react-hook-form';
import { TextFieldProps } from '@mui/material';
import { isEmpty } from 'lodash';
import { GenericFormField } from '../../../containers';
import { FormInput, FormInputProps } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormDatePicker } from '../FormDatePicker';

export interface SingleColumnFormProps<FormValuesType> {
  fields: GenericFormField<FormValuesType>[];
  control: Control<FormValuesType>;
  register: UseFormRegister<FormValuesType>;
  errors: DeepMap<DeepPartial<UnionLike<FormValuesType>>, FieldError>;
  dirtyFields: DeepMap<DeepPartial<UnionLike<FormValuesType>>, true>;
  inputsVariant?: FormInputProps<FormValuesType>['variant'];
  formInputsProps?: TextFieldProps;
  disabled?: boolean;
}

export type TSingleColumnForm = <FormValuesType>(
  props: PropsWithChildren<SingleColumnFormProps<FormValuesType>>
) => ReactElement;

export const SingleColumnForm: TSingleColumnForm = ({
  fields,
  control,
  register,
  errors,
  dirtyFields,
  inputsVariant,
  formInputsProps,
  disabled,
}) => {
  // (errors as any) & (dirtyFields as any) added until react-hook-form
  // allows to index those objects by field.name
  return (
    <>
      {fields.map(
        (field) =>
          (field.select && (
            <FormSelect
              key={field.label}
              field={field}
              control={control}
              errorExists={!isEmpty((errors as any)[field.name])}
              errorText={(errors as any)[field.name]?.message ?? ''}
              variant={inputsVariant}
              disabled={disabled}
              register={register}
            />
          )) ||
          (field.datePicker && (
            <FormDatePicker
              disabled={disabled}
              key={field.label}
              field={field}
              control={control}
              errorExists={!isEmpty((errors as any)[field.name])}
              errorText={(errors as any)[field.name]?.message ?? ''}
              variant={inputsVariant}
            />
          )) || (
            <FormInput
              key={field.label}
              field={field}
              disabled={disabled}
              register={register}
              errorExists={!isEmpty((errors as any)[field.name])}
              errorText={(errors as any)[field.name]?.message ?? ''}
              isDirty={!!(dirtyFields as any)[field.name]}
              variant={inputsVariant}
              {...formInputsProps}
            />
          )
      )}
    </>
  );
};
