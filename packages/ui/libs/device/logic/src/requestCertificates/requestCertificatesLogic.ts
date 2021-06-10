import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { TUseRequestCertificatesLogic } from './types';

export const useRequestCertificatesLogic: TUseRequestCertificatesLogic = () => {
  const { t } = useTranslation();

  return {
    initialValues: {
      energy: '',
      fromTime: '',
      toTime: '',
    },
    validationSchema: yup.object({
      fromTime: yup
        .string()
        .required()
        .label(t('device.my.requestCertificates.fromTime')),
      toTime: yup
        .string()
        .required()
        .label(t('device.my.requestCertificates.toTime')),
      energy: yup
        .string()
        .matches(
          /^\d+$/,
          t('validation.positiveInt', {
            field: t('device.my.requestCertificates.energy'),
          })
        )
        .required()
        .label(t('device.my.requestCertificates.energy')),
    }),
    fields: [
      {
        name: 'fromTime',
        label: t('device.my.requestCertificates.fromTime'),
        datePicker: true,
      },
      {
        name: 'toTime',
        label: t('device.my.requestCertificates.toTime'),
        datePicker: true,
      },
      {
        name: 'energy',
        label: t('device.my.requestCertificates.energy'),
      },
    ],
    buttonFullWidth: true,
    buttonText: t('general.buttons.confirm'),
  };
};
