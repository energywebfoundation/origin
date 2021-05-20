import { Role } from '@energyweb/origin-backend-core';
import { RoleDescription, TRoleChangedLogic } from './types';

export const getRoleChangedLogic: TRoleChangedLogic = ({
  t,
  closeModal,
  role,
  orgName,
  ownerName,
  isIRecEnabled,
}) => {
  const memberActions = (isMainRole: boolean) => ({
    title: isMainRole
      ? t('organization.modals.roleChanged.asMemberYouCan')
      : t('organization.modals.roleChanged.asAMemberYouCanAlso'),
    actions: [
      t('organization.modals.roleChanged.canPlaceOrder'),
      t('organization.modals.roleChanged.canBuyCertificates', {
        certificateType: isIRecEnabled ? 'I-RECs' : 'certificates',
      }),
      t('organization.modals.roleChanged.canCreateAndBuyCertificateBundles', {
        certificateType: isIRecEnabled ? 'I-REC' : 'certificate',
      }),
      t('organization.modals.roleChanged.canRedeemCertificates', {
        certificateType: isIRecEnabled ? 'I-RECs' : 'certificates',
      }),
      t('organization.modals.roleChanged.canWithdrawCertificates', {
        certificateType: isIRecEnabled ? 'I-RECs' : 'certificates',
      }),
    ],
  });

  const deviceManagerActions = (isMainRole: boolean) => ({
    title: isMainRole
      ? t('organization.modals.roleChanged.asDeviceManagerYouCan')
      : t('organization.modals.roleChanged.asDeviceManagerYouCanAlso'),
    actions: [
      t('organization.modals.roleChanged.canRegisterDevices'),
      t('organization.modals.roleChanged.canRequestIssuenceOfCertificates', {
        certificateType: isIRecEnabled ? 'I-RECs' : 'certificates',
      }),
      t('organization.modals.roleChanged.canConfigureAutomatedOrderCreation'),
    ],
  });

  const orgAdminActions = {
    title: t('organization.modals.roleChanged.asOrgAdminYouCan'),
    actions: [
      t('organization.modals.roleChanged.canAddOrRemoveOrgMembers'),
      t('organization.modals.roleChanged.canEditUserRoles'),
      isIRecEnabled && t('organization.modals.roleChanged.connectOrgToIRec'),
    ],
  };
  let roleDescriptions: RoleDescription[] = [];

  switch (role) {
    case Role.OrganizationUser:
      roleDescriptions = [memberActions(true)];
    case Role.OrganizationDeviceManager:
      roleDescriptions = [deviceManagerActions(true), memberActions(false)];
    case Role.OrganizationAdmin:
      roleDescriptions = [
        orgAdminActions,
        deviceManagerActions(false),
        memberActions(false),
      ];
  }

  return {
    title: t('organization.modals.roleChanged.title', {
      organizationName: orgName,
    }),
    subtitle: t('organization.modals.roleChanged.text', {
      organizationName: orgName,
      ownerName: ownerName,
    }),
    roleDescriptions,
    buttons: [{ label: 'Ok', onClick: closeModal }],
  };
};
