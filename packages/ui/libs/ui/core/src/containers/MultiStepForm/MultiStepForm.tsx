import { Typography, TypographyVariant, ButtonProps } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement, FC } from 'react';
import { UnpackNestedValue } from 'react-hook-form';
import { StepReport } from '../../components/form';
import { GenericFormProps, GenericFormSecondaryButton } from '../GenericForm';
import { useMultiStepFormEffects } from './MultiStepForm.effects';

export type MultiStepFormItem<FormValuesType> = Omit<
  GenericFormProps<FormValuesType>,
  'submitHandler' | 'loading' | 'secondaryButtons'
> & {
  customStep?: boolean;
  component?: FC<{
    submitHandler: (values: UnpackNestedValue<FormValuesType>) => Promise<void>;
    secondaryButtons?: GenericFormSecondaryButton[];
    loading?: boolean;
  }>;
};

export interface MultiStepFormProps<FormValuesMerged> {
  heading: string;
  headingVariant?: TypographyVariant;
  forms: MultiStepFormItem<any>[];
  backButtonText: string;
  backButtonProps?: ButtonProps;
  submitHandler: (values: FormValuesMerged) => void;
  loading?: boolean;
}

export type TMultiStepForm = <FormValuesMerged>(
  props: PropsWithChildren<MultiStepFormProps<FormValuesMerged>>
) => ReactElement;

export const MultiStepForm: TMultiStepForm = ({
  heading,
  headingVariant,
  forms,
  submitHandler,
  backButtonText,
  backButtonProps,
  loading,
}) => {
  const { stepperLabels, activeStep, getCurrentForm } = useMultiStepFormEffects(
    { forms, submitHandler, backButtonText, backButtonProps, loading }
  );
  return (
    <>
      <Typography variant={headingVariant ?? 'h5'}>{heading}</Typography>

      <StepReport labels={stepperLabels} activeStep={activeStep} />

      {getCurrentForm(activeStep)}
    </>
  );
};
