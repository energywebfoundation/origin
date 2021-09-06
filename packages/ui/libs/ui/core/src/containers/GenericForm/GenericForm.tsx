import { Box, Button, Typography, CircularProgress } from '@material-ui/core';
import React, { memo } from 'react';
import { DoubleColumnForm, SingleColumnForm } from '../../components';
import { useGenericFormEffects } from './GenericForm.effects';
import { TGenericForm } from './GenericForm.types';

export const GenericForm: TGenericForm = memo(
  ({
    fields,
    submitHandler,
    validationSchema,
    initialValues,
    buttonText,
    hideSubmitButton = false,
    formTitle,
    formTitleVariant,
    buttonFullWidth = false,
    buttonWrapperProps,
    secondaryButtons,
    formClass,
    inputsVariant,
    formInputsProps,
    partOfMultiForm = false,
    twoColumns = false,
    inputsToWatch,
    onWatchHandler,
    buttonDisabled = false,
    validationMode = 'onBlur',
    loading = false,
    acceptInitialValues = false,
    formDisabled = false,
    children,
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
      acceptInitialValues,
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
            disabled={formDisabled}
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
            disabled={formDisabled}
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
            disabled={submitButtonDisabled || loading}
            type="submit"
          >
            {buttonText}
            {loading && (
              <Box ml={2}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Button>
        </Box>
      </form>
    );
  }
);
