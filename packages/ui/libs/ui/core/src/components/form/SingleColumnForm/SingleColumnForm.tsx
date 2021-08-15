import React, { PropsWithChildren, ReactElement } from 'react';
import { Control, DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { BaseTextFieldProps } from '@material-ui/core';
import { isEmpty } from 'lodash';
import { GenericFormField } from '../../../containers';
import { FormInput, FormInputProps } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormDatePicker } from '../FormDatePicker';

export interface SingleColumnFormProps<FormValuesType> {
  fields: GenericFormField<FormValuesType>[];
  control: Control<FormValuesType>;
  register: UseFormRegister<FormValuesType>;
  errors: DeepMap<FormValuesType, FieldError>;
  dirtyFields: DeepMap<FormValuesType, true>;
  inputsVariant?: FormInputProps<FormValuesType>['variant'];
  formInputsProps?: BaseTextFieldProps;
  editDisabled?: boolean;
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
  editDisabled,
}) => {
  return (
    <>
      {fields.map(
        (field) =>
          (field.select && (
            <FormSelect
              key={field.label}
              field={field}
              control={control}
              errorExists={!isEmpty(errors[field.name])}
              errorText={(errors[field.name] as any)?.message ?? ''}
              variant={inputsVariant}
              register={register}
            />
          )) ||
          (field.datePicker && (
            <FormDatePicker
              disabled={editDisabled}
              key={field.label}
              field={field}
              control={control}
              errorExists={!isEmpty(errors[field.name])}
              errorText={(errors[field.name] as any)?.message ?? ''}
              variant={inputsVariant}
            />
          )) || (
            <FormInput
              key={field.label}
              field={field}
              disabled={editDisabled}
              register={register}
              errorExists={!isEmpty(errors[field.name])}
              errorText={(errors[field.name] as any)?.message ?? ''}
              isDirty={!!dirtyFields[field.name]}
              variant={inputsVariant}
              {...formInputsProps}
            />
          )
      )}
    </>
  );
};
