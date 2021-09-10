import {
  ShortConnectionDTO,
  CreateConnectionDTO,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

export const useConnectIRecFormLogic = (
  iRecConnection: ShortConnectionDTO,
  loading: boolean
): Omit<GenericFormProps<CreateConnectionDTO>, 'submitHandler'> => {
  const { t } = useTranslation();
  return {
    formTitle: t('organization.connectIRec.iRecApiCredentials'),
    initialValues: {
      userName: iRecConnection?.userName || '',
      password: '',
      clientId: iRecConnection?.clientId || '',
      clientSecret: '',
    },
    validationSchema: yup.object().shape({
      userName: yup
        .string()
        .required()
        .label(t('organization.connectIRec.userName')),
      password: yup
        .string()
        .required()
        .label(t('organization.connectIRec.apiKey')),
      clientId: yup
        .string()
        .required()
        .label(t('organization.connectIRec.clientId')),
      clientSecret: yup
        .string()
        .required()
        .label(t('organization.connectIRec.clientSecret')),
    }),
    fields: [
      {
        name: 'userName',
        label: t('organization.connectIRec.userName'),
        required: true,
      },
      {
        name: 'password',
        label: t('organization.connectIRec.apiKey'),
        required: true,
      },
      {
        name: 'clientId',
        label: t('organization.connectIRec.clientId'),
        required: true,
      },
      {
        name: 'clientSecret',
        label: t('organization.connectIRec.clientSecret'),
        required: true,
      },
    ],
    loading,
    inputsVariant: 'filled',
    formTitleVariant: 'h6',
    buttonText: t('general.buttons.submit'),
    buttonDisabled: Boolean(iRecConnection?.active),
    formDisabled: Boolean(iRecConnection?.active),
  };
};
