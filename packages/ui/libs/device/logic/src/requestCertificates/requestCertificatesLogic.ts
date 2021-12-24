import dayjs from 'dayjs';
import { GenericFormField } from '@energyweb/origin-ui-core';
import { prepareAccountCodeOptions } from '../utils';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  TUseRequestCertificatesLogic,
  RequestCertificateFormValues,
} from './types';

export const useRequestCertificatesLogic: TUseRequestCertificatesLogic = (
  myAccounts,
  singleAccountMode
) => {
  const { t } = useTranslation();

  return {
    initialValues: {
      energy: '',
      irecTradeAccountCode: '',
      fromTime: dayjs().toISOString(),
      toTime: dayjs().toISOString(),
    },
    validationMode: 'onSubmit',
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
        .number()
        .min(1)
        .required()
        .label(t('device.my.requestCertificates.energy')),
    }),
    fields: [
      {
        name: 'fromTime',
        label: t('device.my.requestCertificates.fromTime'),
        datePicker: true,
        inputProps: { ['data-cy']: 'fromTime' },
      },
      {
        name: 'toTime',
        label: t('device.my.requestCertificates.toTime'),
        datePicker: true,
        inputProps: { ['data-cy']: 'toTime' },
      },
      {
        name: 'energy',
        label: t('device.my.requestCertificates.energy'),
        inputProps: { ['data-cy']: 'certificatesEnergy' },
      },
      ...(singleAccountMode
        ? ([
            {
              name: 'irecTradeAccountCode',
              label: t('device.my.requestCertificates.irecTradeAccountCode'),
              select: true,
              options: prepareAccountCodeOptions(myAccounts),
            },
          ] as GenericFormField<RequestCertificateFormValues>[])
        : []),
    ],
    buttonFullWidth: true,
    buttonText: t('general.buttons.confirm'),
    buttonProps: { ['data-cy']: 'requestCertificatesButton' },
  };
};
