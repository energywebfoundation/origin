import { Box, Button, Typography } from '@material-ui/core';
import React, { memo } from 'react';
import { DoubleColumnForm, SingleColumnForm } from '../../components';
import { useGenericFormEffects } from './GenericForm.effects';
import { TGenericForm } from './GenericForm.types';

export const GenericForm: TGenericForm = memo(
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
    secondaryButtons,
    children,
    formClass,
    inputsVariant,
    formInputsProps,
    partOfMultiForm,
    twoColumns,
    hideSubmitButton,
    inputsToWatch,
    onWatchHandler,
    buttonDisabled,
    validationMode,
  }) => {
    const {
      control,
      register,
      onSubmit,
      errors,
      submitButtonDisabled,
      dirtyFields,
    } = useGenericFormEffects({
      validationSchema,
      submitHandler,
      initialValues,
      partOfMultiForm,
      inputsToWatch,
      onWatchHandler,
      buttonDisabled,
      validationMode,
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
            formInputsProps={formInputsProps}
            inputsVariant={inputsVariant}
          />
        ) : (
          <SingleColumnForm
            fields={fields}
            control={control}
            register={register}
            errors={errors}
            dirtyFields={dirtyFields}
            formInputsProps={formInputsProps}
            inputsVariant={inputsVariant}
          />
        )}

        {children}

        <Box
          hidden={hideSubmitButton}
          my={2}
          display="flex"
          justifyContent="flex-end"
          {...buttonWrapperProps}
        >
          {secondaryButtons &&
            secondaryButtons.map((button) => (
              <Button key={`secondary-button-${button.label}`} {...button}>
                {button.label}
              </Button>
            ))}
          <Button
            fullWidth={buttonFullWidth}
            color="primary"
            name="submit"
            size="large"
            variant="contained"
            disabled={submitButtonDisabled}
            type="submit"
          >
            {buttonText}
          </Button>
        </Box>
      </form>
    );
  }
);
