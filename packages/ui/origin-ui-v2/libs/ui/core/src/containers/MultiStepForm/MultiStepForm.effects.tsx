import React from 'react';
import { useState } from 'react';
import { GenericForm } from '../GenericForm';
import { MultiStepFormProps } from './MultiStepForm';

type TUseMultiStepEffectsArgs = Pick<
  MultiStepFormProps,
  'forms' | 'submitHandler'
>;

type FormStore = {
  [key: string]: any;
};

export const useMultiStepFormEffects = ({
  forms,
  submitHandler,
}: TUseMultiStepEffectsArgs) => {
  const [activeStep, setActiveStep] = useState(0);
  const [store, setStore] = useState<FormStore>(null);

  const nextButtonHandler = (values: any): void => {
    if (activeStep + 1 === forms.length) {
      return submitHandler({ ...store, values });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setStore({ ...store, values });
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
