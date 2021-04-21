import {
  Box,
  BoxProps,
  Button,
  Typography,
  TypographyVariant,
} from '@material-ui/core';
import React, { FC, memo, ReactNode } from 'react';
import {
  DoubleColumnForm,
  FormInputProps,
  FormSelectOption,
  SingleColumnForm,
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
  buttonWrapperProps?: BoxProps;
  formTitle?: string;
  formTitleVariant?: TypographyVariant;
  formClass?: string;
  inputsVariant?: FormInputProps['variant'];
  inputsClass?: string;
  partOfMultiForm?: boolean;
  twoColumns?: boolean;
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
    buttonWrapperProps,
    children,
    formClass,
    inputsVariant,
    inputsClass,
    partOfMultiForm,
    twoColumns,
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

        {twoColumns ? (
          <DoubleColumnForm
            fields={fields}
            control={control}
            register={register}
            errors={errors}
            dirtyFields={dirtyFields}
            inputsClass={inputsClass}
            inputsVariant={inputsVariant}
          />
        ) : (
          <SingleColumnForm
            fields={fields}
            control={control}
            register={register}
            errors={errors}
            dirtyFields={dirtyFields}
            inputsClass={inputsClass}
            inputsVariant={inputsVariant}
          />
        )}

        {children}

        <Box
          my={2}
          display="flex"
          justifyContent="flex-end"
          {...buttonWrapperProps}
        >
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
