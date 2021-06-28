import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  MultiStepFormItem,
  MultiStepFormProps,
} from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type DeviceInfoFormValues = {
  facilityName: string;
  fuelType: string;
  deviceType: string;
  commissioningDate: string;
  registrationDate: string;
  description: string;
  smartMeterId: string;
  capacity: string;
  gridOperator: string;
};
export type TCreateDeviceInfoForm = (
  t: TFunction,
  allFuelTypes: CodeNameDTO[],
  allDeviceTypes: CodeNameDTO[],
  externalDeviceId: string
) => MultiStepFormItem<DeviceInfoFormValues>;

export type DeviceLocationFormValues = {
  countryCode: string;
  region: string;
  subregion: string;
  postalCode: string;
  address: string;
  latitude: string;
  longitude: string;
};
export type TCreateDeviceLocationForm = (
  t: TFunction
) => MultiStepFormItem<DeviceLocationFormValues>;

export type DeviceImagesFormValues = {
  imageIds: string[];
};
export type TCreateDeviceImagesForm = (
  t: TFunction
) => MultiStepFormItem<DeviceImagesFormValues>;

export type FormUnionType =
  | DeviceInfoFormValues
  | DeviceLocationFormValues
  | DeviceImagesFormValues;
export type FormMergedType = DeviceInfoFormValues &
  DeviceLocationFormValues &
  DeviceImagesFormValues;

export type TUseRegisterDeviceFormArgs = {
  allFuelTypes: CodeNameDTO[];
  allDeviceTypes: CodeNameDTO[];
  externalDeviceId: string;
};
export type TUseRegisterDeviceFormLogic = (
  args: TUseRegisterDeviceFormArgs
) => Omit<MultiStepFormProps<FormUnionType, FormMergedType>, 'submitHandler'>;
