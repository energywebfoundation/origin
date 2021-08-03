import React from 'react';
import { useState } from 'react';
import { UnpackNestedValue } from 'react-hook-form';
import { GenericForm } from '../GenericForm';
import { MultiStepFormProps } from './MultiStepForm';

type TUseMultiStepEffectsArgs<Union, Merged> = Pick<
  MultiStepFormProps<Union, Merged>,
  'forms' | 'submitHandler' | 'backButtonText' | 'backButtonProps'
>;

export const useMultiStepFormEffects = <Union, Merged>({
  forms,
  submitHandler,
  backButtonText,
  backButtonProps,
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

  const backButtonHandler = (): void => {
    if (activeStep === 0) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getCurrentForm = (step: number) => {
    const props = forms[step];

    if (props.customStep && props.component) {
      const CustomForm = props.component;

      return <CustomForm submitHandler={nextButtonHandler} {...props} />;
    }

    return (
      <GenericForm
        partOfMultiForm={step > 0 ? true : false}
        submitHandler={nextButtonHandler}
        secondaryButtons={[
          {
            label: backButtonText,
            onClick: backButtonHandler,
            disabled: activeStep === 0,
            variant: 'contained',
            style: { marginRight: 10 },
            ...backButtonProps,
          },
        ]}
        {...props}
      />
    );
  };

  const stepperLabels = forms.map((form) => form.formTitle);

  return { stepperLabels, activeStep, getCurrentForm };
};
