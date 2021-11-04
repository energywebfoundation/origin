import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import { FormSelectOption, GenericFormProps } from '@energyweb/origin-ui-core';

type ImportDeviceFormValues = {
  smartMeterId: string;
  timeZone?: FormSelectOption[];
  gridOperator: string;
  postalCode: string;
  region: FormSelectOption[];
  subregion: FormSelectOption[];
  description: string;
};

export type TUseImportDeviceFormLogicReturnType = Omit<
  GenericFormProps<ImportDeviceFormValues>,
  'submitHandler'
>;

export type TUseImportDeviceFormLogic = (
  handleClose: () => void,
  smartMeterId: string,
  allRegions: ConfigurationDTORegions,
  platformCountryCode: string
) => TUseImportDeviceFormLogicReturnType;
