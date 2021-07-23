import React, { PropsWithChildren, ReactElement } from 'react';
import { GenericFormField } from '../../../containers';
import { FormInput, FormInputProps } from '../FormInput';
import { Control, DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { FormSelect } from '../FormSelect';
import { isEmpty } from 'lodash';
import { BaseTextFieldProps } from '@material-ui/core';
import { FormDatePicker } from '../FormDatePicker';
import { HierarchicalSelect } from '../HierarchicalSelect';

export interface SingleColumnFormProps<FormValuesType> {
  fields: GenericFormField[];
  control: Control<FormValuesType>;
  register: UseFormRegister<FormValuesType>;
  errors: DeepMap<FormValuesType, FieldError>;
  dirtyFields: DeepMap<FormValuesType, true>;
  inputsVariant?: FormInputProps<FormValuesType>['variant'];
  formInputsProps?: BaseTextFieldProps;
  processing?: boolean;
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
  processing,
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
              errorText={errors[field.name]?.message ?? ''}
              variant={inputsVariant}
            />
          )) ||
          (field.datePicker && (
            <FormDatePicker
              disabled={editDisabled || field.frozen}
              key={field.label}
              field={field}
              control={control}
              errorExists={!isEmpty(errors[field.name])}
              errorText={errors[field.name]?.message ?? ''}
              variant={inputsVariant}
            />
          )) ||
          (field.hierarchical && (
            <HierarchicalSelect
              key={field.label}
              disabled={editDisabled || field.frozen}
              field={field}
              control={control}
              errorExists={!isEmpty(errors[field.name])}
              errorText={errors[field.name]?.message ?? ''}
              variant={inputsVariant}
            />
          )) || (
            <FormInput
              key={field.label}
              field={field}
              disabled={editDisabled || field.frozen}
              register={register}
              errorExists={!isEmpty(errors[field.name])}
              errorText={errors[field.name]?.message ?? ''}
              isDirty={dirtyFields[field.name]}
              variant={inputsVariant}
              {...formInputsProps}
            />
          )
      )}
    </>
  );
};
