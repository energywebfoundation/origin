import { isRole, Role } from '@energyweb/origin-backend-core';
import {
  useCachedUser,
  useChangeSelfOwnershipHandler,
} from '@energyweb/origin-ui-user-data';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useFullSelfOwnershipContainerEffects = () => {
  const user = useCachedUser();
  const [fullOwnership, setFullOwnership] = useState(
    Boolean(user?.organization?.selfOwnership)
  );
  const { t } = useTranslation();

  const userIsOrgAdmin = isRole(user, Role.OrganizationAdmin);

  const { changeHandler, isMutating } = useChangeSelfOwnershipHandler(
    user?.organization?.id,
    setFullOwnership
  );

  const toggleOwnership = () => {
    changeHandler(!fullOwnership);
  };

  const fieldLabel = t('user.profile.fullSelfOwnership');
  const popoverText = [t('user.profile.popover.fullSelfOwnership')];

  const switchDisabled = isMutating || !userIsOrgAdmin;

  return {
    fullOwnership,
    toggleOwnership: userIsOrgAdmin ? toggleOwnership : undefined,
    fieldLabel,
    popoverText,
    switchDisabled,
  };
};
