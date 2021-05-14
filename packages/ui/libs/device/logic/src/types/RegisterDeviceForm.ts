import { GenericFormProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type RegisterDeviceFormValues = {
  facilityName: string;
  deviceType: string;
  commissioningDate: Date;
  registrationDate: Date;
  capacity: string;
  region: string;
  province: string;
  gridOperator: string;
  address: string;
  latitude: string;
  longitude: string;
  projectStory: string;
  externalDeviceIdType: string;
};

export type TRegisterDeviceForm = (
  t: TFunction,
  externalDeviceId: string
) => Omit<GenericFormProps<RegisterDeviceFormValues>, 'submitHandler'>;
