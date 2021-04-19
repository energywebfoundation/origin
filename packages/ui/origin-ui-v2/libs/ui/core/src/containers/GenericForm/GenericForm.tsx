import { Box, Button, Typography, TypographyVariant } from '@material-ui/core';
import React, { FC, memo, ReactNode } from 'react';
import { isEmpty } from 'lodash';
import {
  FormInput,
  FormInputProps,
  FormSelect,
  FormSelectOption,
} from '../../components/form';
import { useGenericFormEffects } from './GenericForm.effects';
import * as yup from 'yup';

export type GenericFormField = {
  name: string;
  label: string;
  type?: string;
  select?: boolean;
  options?: FormSelectOption[];
  autocomplete?: boolean;
  multiple?: boolean;
  maxValues?: number;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
};

export interface GenericFormProps {
  submitHandler: (values: any) => void;
  validationSchema: yup.ObjectSchema<any>;
  initialValues: any;
  fields: GenericFormField[];
  buttonText: string;
  buttonFullWidth?: boolean;
  formTitle?: string;
  formTitleVariant?: TypographyVariant;
  formClass?: string;
  inputsVariant?: FormInputProps['variant'];
  inputsClass?: string;
  partOfMultiForm?: boolean;
}

export const GenericForm: FC<GenericFormProps> = memo(
  ({
    submitHandler,
    validationSchema,
    initialValues,
    formTitleVariant,
    formTitle,
    fields,
    buttonText,
    buttonFullWidth,
    children,
    formClass,
    inputsVariant,
    inputsClass,
    partOfMultiForm,
  }) => {
    const {
      control,
      register,
      onSubmit,
      errors,
      buttonDisabled,
      dirtyFields,
    } = useGenericFormEffects({
      validationSchema,
      submitHandler,
      initialValues,
      partOfMultiForm,
    });
    return (
      <form onSubmit={onSubmit} className={formClass}>
        {formTitle && (
          <Box>
            <Typography variant={formTitleVariant ?? 'h4'}>
              {formTitle}
            </Typography>
          </Box>
        )}
        {fields.map((field) =>
          field.select ? (
            <FormSelect
              key={field.label}
              field={field}
              control={control}
              errorExists={!isEmpty(errors[field.name])}
              errorText={errors[field.name]?.message ?? ''}
              variant={inputsVariant}
              className={inputsClass}
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

        {children}

        <Box my={2} display="flex" justifyContent="flex-end">
          <Button
            fullWidth={buttonFullWidth}
            color="primary"
            name="submit"
            size="large"
            variant="contained"
            disabled={buttonDisabled}
            type="submit"
          >
            {buttonText}
          </Button>
        </Box>
      </form>
    );
  }
);
