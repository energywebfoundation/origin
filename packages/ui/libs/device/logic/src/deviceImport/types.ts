import { GenericFormProps } from '@energyweb/origin-ui-core';

type ImportDeviceFormValues = {
  smartMeterId: string;
  timezone: string;
  gridOperator: string;
  postalCode: string;
  region: string;
  subregion: string;
  description: string;
};

export type TUseImportDeviceFormLogic = (
  handleClose: () => void,
  smartMeterId: string
) => Omit<GenericFormProps<ImportDeviceFormValues>, 'submitHandler'>;
