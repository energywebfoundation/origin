import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';

export type RegisterDeviceFormValues = {
  facilityName: string;
  deviceType: string;
  fuelType: string;
  commissioningDate: string;
  registrationDate: string;
  capacity: string;
  region: string;
  subregion: string;
  province: string;
  gridOperator: string;
  address: string;
  latitude: string;
  longitude: string;
  projectStory: string;
  smartMeterId: string;
};

export type TUseRegisterDeviceFormLogic = (
  allFuelTypes: CodeNameDTO[],
  allDeviceTypes: CodeNameDTO[],
  externalDeviceId: string
) => Omit<GenericFormProps<RegisterDeviceFormValues>, 'submitHandler'>;
