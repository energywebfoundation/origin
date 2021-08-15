import { FormInputField } from '@energyweb/origin-ui-core';
import { ButtonProps, TextFieldProps } from '@material-ui/core';
import * as yup from 'yup';

type BidFormValues = {
  energy: number;
  price: number;
};

export type TUseOneTimePurchaseFormLogic = (mobileView: boolean) => {
  initialValues: BidFormValues;
  validationSchema: yup.AnyObjectSchema;
  fields: {
    generationFrom: {
      name: string;
      label: string;
      textFieldProps: TextFieldProps;
    };
    generationTo: {
      name: string;
      label: string;
      textFieldProps: TextFieldProps;
    };
    energy: FormInputField<BidFormValues>;
    price: FormInputField<BidFormValues>;
  };
  buttons: [
    {
      label: string;
      buttonProps: {
        variant: ButtonProps['variant'];
      };
    }
  ];
};
