import React from 'react';
import { useState } from 'react';
import { UnpackNestedValue } from 'react-hook-form';
import { GenericForm } from '../GenericForm';
import { MultiStepFormProps } from './MultiStepForm';

type TUseMultiStepEffectsArgs<Union, Merged> = Pick<
  MultiStepFormProps<Union, Merged>,
  'forms' | 'submitHandler'
>;

export const useMultiStepFormEffects = <Union, Merged>({
  forms,
  submitHandler,
}: TUseMultiStepEffectsArgs<Union, Merged>) => {
  const [activeStep, setActiveStep] = useState(0);
  const [store, setStore] = useState<Merged>(null);

  const nextButtonHandler = async (
    values: UnpackNestedValue<Union>
  ): Promise<void> => {
    if (activeStep + 1 === forms.length) {
      return await submitHandler({ ...store, ...values });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setStore({ ...store, ...values });
  };

  const getCurrentForm = (step: number) => {
    const props = forms[step];
    return (
      <GenericForm
        partOfMultiForm={step > 0 ? true : false}
        submitHandler={nextButtonHandler}
        {...props}
      />
    );
  };

  const stepperLabels = forms.map((form) => form.formTitle);

  return { stepperLabels, activeStep, getCurrentForm };
};
