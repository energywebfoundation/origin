import { Role } from '@energyweb/origin-backend-core';
import { GenericModalProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type RoleDescription = {
  title: string;
  actions: string[];
};

type RoleChangeLogicArgs = {
  t: TFunction;
  closeModal: () => void;
  role: Role;
  orgName: string;
  ownerName: string;
  isIRecEnabled: boolean;
};

export type TRoleChangedLogic = (args: RoleChangeLogicArgs) => Omit<
  GenericModalProps,
  'open' | 'icon' | 'text'
> & {
  subtitle: string;
  roleDescriptions: RoleDescription[];
};

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
  const roleDescriptions: RoleDescription[] =
    role === Role.OrganizationUser
      ? [memberActions(true)]
      : role === Role.OrganizationDeviceManager
      ? [deviceManagerActions(true), memberActions(false)]
      : role === Role.OrganizationAdmin
      ? [orgAdminActions, deviceManagerActions(false), memberActions(false)]
      : [];

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
