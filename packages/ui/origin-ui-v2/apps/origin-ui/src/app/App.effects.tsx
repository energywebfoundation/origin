import { useOrganizationMenu } from '@energyweb/origin-ui-organization-logic';

export const useAppEffects = () => {
  const orgMenu = useOrganizationMenu({
    isLoggedIn: true,
    userHasOrg: true,
    userIsAdminOrSupport: false,
    userIsOrgAdmin: true,
    userIsActive: true,
    userOrgHasIRec: false,
    invitationsExist: true,
  });
  return { orgMenu };
};
