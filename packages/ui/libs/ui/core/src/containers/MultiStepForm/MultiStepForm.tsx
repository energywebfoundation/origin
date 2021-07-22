import { Typography, TypographyVariant } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement, FC } from 'react';
import { StepReport } from '../../components/form';
import { GenericFormProps } from '../GenericForm';
import { useMultiStepFormEffects } from './MultiStepForm.effects';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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
