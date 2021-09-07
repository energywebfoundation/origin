import { CreateConnectionDTO } from '@energyweb/origin-organization-irec-api-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  useConnectIRecHandler,
  useMyIRecConnection,
  useMyOrganizationData,
} from '@energyweb/origin-ui-organization-data';
import { useConnectIRecFormLogic } from '@energyweb/origin-ui-organization-logic';
import { ThemeModeEnum } from '@energyweb/origin-ui-theme';
import { useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const useConnectIRecPageEffects = () => {
  const { t } = useTranslation();

  const {
    iRecConnection,
    isLoading: iRecConnectionLoading,
  } = useMyIRecConnection();
  const { organization, organizationLoading } = useMyOrganizationData();

  const { submitHandler, isMutating } = useConnectIRecHandler();
  const formLogic = useConnectIRecFormLogic(iRecConnection, isMutating);

  const formProps: GenericFormProps<CreateConnectionDTO> = {
    submitHandler,
    ...formLogic,
  };

  const requestingIRecAccess = t(
    'organization.connectIRec.requestingIRecAccess'
  );
  const orgInformation = t('organization.connectIRec.orgInformation');
  const platformOrgId = t('organization.connectIRec.platformOrgId');

  const isLoading = iRecConnectionLoading || organizationLoading;
  const organizationId = organization?.id;

  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === ThemeModeEnum.Dark;

  return {
    isDarkTheme,
    isLoading,
    formProps,
    requestingIRecAccess,
    orgInformation,
    platformOrgId,
    organizationId,
  };
};
