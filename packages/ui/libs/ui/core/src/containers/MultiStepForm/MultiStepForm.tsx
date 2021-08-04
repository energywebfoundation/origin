import { Typography, TypographyVariant, ButtonProps } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement, FC } from 'react';
import { StepReport } from '../../components/form';
import { GenericFormProps } from '../GenericForm';
import { useMultiStepFormEffects } from './MultiStepForm.effects';

export type MultiStepFormItem<FormValuesType> = Omit<
  GenericFormProps<FormValuesType>,
  'submitHandler'
> & {
  customStep?: boolean;
  component?: FC<any>;
};

export interface MultiStepFormProps<FormValuesUnion, FormValuesMerged> {
  heading: string;
  headingVariant?: TypographyVariant;
  forms: MultiStepFormItem<FormValuesUnion>[];
  backButtonText: string;
  backButtonProps?: ButtonProps;
  submitHandler: (values: FormValuesMerged) => void;
}

export type TMultiStepForm = <FormValuesUnion, FormValuesMerged>(
  props: PropsWithChildren<
    MultiStepFormProps<FormValuesUnion, FormValuesMerged>
  >
) => ReactElement;

export const MultiStepForm: TMultiStepForm = ({
  heading,
  headingVariant,
  forms,
  submitHandler,
  backButtonText,
  backButtonProps,
}) => {
  const { stepperLabels, activeStep, getCurrentForm } = useMultiStepFormEffects(
    { forms, submitHandler, backButtonText, backButtonProps }
  );
  return (
    <>
      <Typography variant={headingVariant ?? 'h5'}>{heading}</Typography>

      <StepReport labels={stepperLabels} activeStep={activeStep} />

      {getCurrentForm(activeStep)}
    </>
  );
};
