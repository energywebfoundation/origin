import { useTranslation } from 'react-i18next';
import {
  TUsePermissions,
  IPermissionRule,
  IPermissionReturnType,
  Requirement,
} from './types';

export const usePermissionsLogic = ({
  hasActiveOrg,
  hasIRecOrg,
  iRecConnectionActive,
  config,
}: TUsePermissions): IPermissionReturnType => {
  const { t } = useTranslation();

  const predicateList: Record<Requirement, IPermissionRule> = {
    [Requirement.HasActiveOrganization]: {
      label: t('general.requirements.userHasToBePartOfApprovedOrganization'),
      passing: hasActiveOrg,
    },
    [Requirement.HasIRecOrg]: {
      label: t('general.requirements.hasToHaveIRecOrg'),
      passing: hasIRecOrg,
    },
    [Requirement.HasIRecApiConnection]: {
      label: t('general.requirements.hasToHaveActiveIRecConnection'),
      passing: iRecConnectionActive,
    },
  };

  const title = t('general.requirements.requirementsTitle');
  const rules = config.map((requirement) => predicateList[requirement]);
  const canAccessPage = rules.every((r) => r.passing);

  const requirementsProps = {
    rules,
    title,
  };

  return {
    canAccessPage,
    requirementsProps,
  };
};
