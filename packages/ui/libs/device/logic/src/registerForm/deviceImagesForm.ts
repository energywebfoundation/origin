import { TCreateDeviceImagesForm } from './types';

export const createDeviceImagesForm: TCreateDeviceImagesForm = (t) => ({
  formTitle: t('device.register.deviceImagesFormTitle'),
  initialValues: {
    imageIds: [],
  },
  fields: null,
  validationSchema: null,
  customStep: true,
  buttonText: t('general.buttons.submit'),
});
