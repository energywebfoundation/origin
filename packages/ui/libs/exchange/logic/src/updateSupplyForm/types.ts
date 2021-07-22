import { GenericFormProps } from '@energyweb/origin-ui-core';
import { IDeviceWithSupply } from '@energyweb/origin-ui-exchange-logic';

export type TUpdateSupplyFormValues = {
  fuelType: string;
  facilityName: string;
  price: number;
  status: string;
};

export type TUseUpdateSupplyFormLogic = (
  handleClose: () => void,
  deviceWithSupply: IDeviceWithSupply
) => Omit<GenericFormProps<TUpdateSupplyFormValues>, 'submitHandler'>;
