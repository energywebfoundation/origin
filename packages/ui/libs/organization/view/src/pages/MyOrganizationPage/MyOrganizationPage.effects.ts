import { useTranslation } from 'react-i18next';
import { useMyOrganizationData } from '@energyweb/origin-ui-organization-data';
import { organizationViewLogic } from '@energyweb/origin-ui-organization-logic';

export const useMyOrganizationPageEffects = () => {
  const { t } = useTranslation();
  const { isLoading, organization } = useMyOrganizationData();

  const data = organization ? organizationViewLogic(t, organization) : [];
  const heading = t('organization.view.title');

  return { isLoading, data, heading };
};
