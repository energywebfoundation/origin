import { Typography, TypographyVariant } from '@material-ui/core';
import React from 'react';
import { FC } from 'react';
import { StepReport } from '../../components/form';
import { GenericFormProps } from '../GenericForm';
import { useMultiStepFormEffects } from './MultiStepForm.effects';

export type MultiStepFormItem = Omit<GenericFormProps, 'submitHandler'>;

export interface MultiStepFormProps {
  heading: string;
  headingVariant?: TypographyVariant;
  forms: MultiStepFormItem[];
  submitHandler: (values: any) => void;
}

export const MultiStepForm: FC<MultiStepFormProps> = ({
  heading,
  headingVariant,
  forms,
  submitHandler,
}) => {
  const {
    stepperLabels,
    activeStep,
    getCurrentForm,
  } = useMultiStepFormEffects({ forms, submitHandler });
  return (
    <>
      <Typography variant={headingVariant ?? 'h5'}>{heading}</Typography>

      <StepReport labels={stepperLabels} activeStep={activeStep} />

      {getCurrentForm(activeStep)}
    </>
  );
};
