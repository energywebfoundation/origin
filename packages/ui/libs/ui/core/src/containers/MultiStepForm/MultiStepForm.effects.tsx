import React from 'react';
import { useState } from 'react';
import { UnpackNestedValue } from 'react-hook-form';
import { GenericForm } from '../GenericForm';
import { MultiStepFormProps } from './MultiStepForm';

type TUseMultiStepEffectsArgs<Merged> = Pick<
  MultiStepFormProps<Merged>,
  'forms' | 'submitHandler' | 'backButtonText' | 'backButtonProps'
>;

type TUseMultiStepEffects = <Merged>(
  args: TUseMultiStepEffectsArgs<Merged>
) => {
  stepperLabels: string[];
  activeStep: number;
  getCurrentForm: (step: number) => JSX.Element;
};

export const useMultiStepFormEffects: TUseMultiStepEffects = ({
  forms,
  submitHandler,
  backButtonText,
  backButtonProps,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [store, setStore] = useState<any>(null);

  const nextButtonHandler = async (
    values: UnpackNestedValue<any>
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

      return (
        <CustomForm
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
