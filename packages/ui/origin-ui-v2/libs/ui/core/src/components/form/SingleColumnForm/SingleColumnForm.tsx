import React, { FC } from 'react';
import { GenericFormField } from '../../../containers';
import { FormInput, FormInputProps } from '../FormInput';
import { Control, DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { FormSelect } from '../FormSelect';
import { isEmpty } from 'lodash';

export interface SingleColumnFormProps {
  fields: GenericFormField[];
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: DeepMap<any, FieldError>;
  dirtyFields: DeepMap<any, true>;
  inputsVariant?: FormInputProps['variant'];
  inputsClass?: string;
}

export const SingleColumnForm: FC<SingleColumnFormProps> = ({
  fields,
  control,
  register,
  errors,
  dirtyFields,
  inputsVariant,
  inputsClass,
}) => {
  return (
    <>
      {fields.map((field) =>
        field.select ? (
          <FormSelect
            key={field.label}
            field={field}
            control={control}
            errorExists={!isEmpty(errors[field.name])}
            errorText={errors[field.name]?.message ?? ''}
            variant={inputsVariant}
          />
        ) : (
          <FormInput
            className={inputsClass}
            key={field.label}
            field={field}
            register={register}
            errorExists={!isEmpty(errors[field.name])}
            errorText={errors[field.name]?.message ?? ''}
            isDirty={dirtyFields[field.name]}
            variant={inputsVariant}
          />
        )
      )}
    </>
  );
};
