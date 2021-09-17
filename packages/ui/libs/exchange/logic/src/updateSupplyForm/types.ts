import { GenericFormProps } from '@energyweb/origin-ui-core';
import { IDeviceWithSupply } from '../supply';

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
