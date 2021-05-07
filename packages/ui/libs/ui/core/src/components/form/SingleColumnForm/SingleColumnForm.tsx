import React, { FC } from 'react';
import { GenericFormField } from '../../../containers';
import { FormInput, FormInputProps } from '../FormInput';
import { Control, DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { FormSelect } from '../FormSelect';
import { isEmpty } from 'lodash';
import { BaseTextFieldProps } from '@material-ui/core';
import { FormDatePicker } from '../FormDatePicker';
import { HierarchicalSelect } from '../HierarchicalSelect';

export interface SingleColumnFormProps {
  fields: GenericFormField[];
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: DeepMap<any, FieldError>;
  dirtyFields: DeepMap<any, true>;
  inputsVariant?: FormInputProps['variant'];
  formInputsProps?: BaseTextFieldProps;
}

export const SingleColumnForm: FC<SingleColumnFormProps> = ({
  fields,
  control,
  register,
  errors,
  dirtyFields,
  inputsVariant,
  formInputsProps,
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
