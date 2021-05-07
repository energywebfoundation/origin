// @should localize & should finish
// import { Role } from "@energyweb/origin-backend-core";
import { TRoleChangedLogic } from './types';

export const roleChangedLogic: TRoleChangedLogic = ({
  setOpen,
  role,
  orgName,
  iRecPlatform,
}) => {
  // const getAsRoleYouCan = (role: Role) => {
  //   switch (role) {
  //       case Role.OrganizationAdmin:
  //           return ('user.feedback.roleChanged.asOrgAdminYouCan');
  //       case Role.OrganizationDeviceManager:
  //           return ('user.feedback.roleChanged.asDeviceManYouCan');
  //       case Role.OrganizationUser:
  //           return ('user.feedback.roleChanged.asMemberYouCan');
  //   }
  // };

  //   const allowedActions = (role: Role) => {
  //     let actions: string[];
  //     switch (role) {
  //         case Role.OrganizationUser:
  //             actions = [
  //                 t('user.feedback.roleChanged.canPlaceOrder'),
  //                 t('user.feedback.roleChanged.canBuyCertificates', {
  //                     certificateType: iRecPlatform ? 'I-RECs' : 'certificates'
  //                 }),
  //                 t('user.feedback.roleChanged.canCreateAndBuyCertificateBundles', {
  //                     certificateType: iRecPlatform ? 'I-REC' : 'certificate'
  //                 }),
  //                 t('user.feedback.roleChanged.canRedeemCertificates', {
  //                     certificateType: iRecPlatform ? 'I-RECs' : 'certificates'
  //                 }),
  //                 t('user.feedback.roleChanged.canWithdrawCertificates', {
  //                     certificateType: iRecPlatform ? 'I-RECs' : 'certificates'
  //                 })
  //             ];
  //             break;
  //         case Role.OrganizationDeviceManager:
  //             actions = [
  //                 t('user.feedback.roleChanged.canRegisterDevices'),
  //                 t('user.feedback.roleChanged.canRequestIssuenceOfCertificates', {
  //                     certificateType: iRecPlatform ? 'I-RECs' : 'certificates'
  //                 }),
  //                 t('user.feedback.roleChanged.canConfigureAutomatedOrderCreation')
  //             ];
  //             break;
  //         case Role.OrganizationAdmin:
  //             actions = [
  //                 ('user.feedback.roleChanged.canAddOrRemoveOrgMembers'),
  //                 ('user.feedback.roleChanged.canEditUserRoles')
  //             ];
  //             if (iRecPlatform) {
  //                 actions.push(('user.feedback.roleChanged.connectOrgToIRec'));
  //             }
  //             break;
  //         default:
  //             actions = [];
  //             break;
  //     }
  //     return actions.map((action) => action);
  // };

  return {
    title: `Successfully joined ${orgName}`,
    roleDescriptions: [],
    buttons: [{ label: 'Ok', onClick: () => setOpen(false) }],
  };
};
