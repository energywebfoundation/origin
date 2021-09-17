import { TimeFrame } from '@energyweb/exchange-irec-react-query-client';
import {
  FormDatePickerProps,
  FormInputField,
  FormSelectProps,
} from '@energyweb/origin-ui-core';
import { ButtonProps } from '@material-ui/core';
import { Dayjs } from 'dayjs';
import * as yup from 'yup';

type DemandFormValues = {
  period: TimeFrame;
  volume: number;
  startDate: Dayjs;
  endDate: Dayjs;
  price: number;
};

export type TUseRepeatedPurchaseFormLogic = (
  mobileView: boolean
) => {
  initialValues: DemandFormValues;
  validationSchema: yup.AnyObjectSchema;
  fields: {
    period: FormSelectProps<DemandFormValues>['field'];
    volume: FormInputField<DemandFormValues>;
    startDate: FormDatePickerProps<DemandFormValues>['field'];
    endDate: FormDatePickerProps<DemandFormValues>['field'];
    totalVolume: {
      name: string;
      label: string;
    };
    price: FormInputField<DemandFormValues>;
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
