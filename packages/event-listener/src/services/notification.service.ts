// import { Configuration } from '@energyweb/utils-general';
// import { MarketUser } from '@energyweb/market';

// import { OrganizationStatus } from '@energyweb/origin-backend-core';
// import { IOriginEventsStore } from '../stores/OriginEventsStore';

// import EmailTypes from '../email/EmailTypes';
// import { IEmailServiceProvider } from './email.service';

// export interface INotificationService {
//     notify(): Promise<void>;
// }

// export class NotificationService implements INotificationService {
//     constructor(
//         private conf: Configuration.Entity,
//         private emailService: IEmailServiceProvider,
//         private originEventsStore: IOriginEventsStore
//     ) {}

//     public async notify() {
//         const onChainUsers: MarketUser.Entity[] = [];
//         const offChainUserEmails: string[] = [];

//         for (const userId of this.originEventsStore.getAllUsers()) {
//             try {
//                 const user = await new MarketUser.Entity(userId, this.conf).sync();
//                 onChainUsers.push(user);
//             } catch (e) {
//                 offChainUserEmails.push(userId);
//             }
//         }

//         for (const user of onChainUsers) {
//             await this.notifyIssuedCertificates(user);
//             await this.notifyMatchingCertificates(user);
//             await this.notifyPartiallyFilledDemand(user);
//             await this.notifyFulfilledDemand(user);
//             await this.notifyDeviceStatusChange(user);
//         }

//         for (const email of offChainUserEmails) {
//             await this.notifyOrganizationStatusChange(email);
//             await this.notifyOrganizationInvitation(email);
//             await this.notifyOrganizationRemovedMember(email);
//         }
//     }

//     private async notifyFulfilledDemand(user: MarketUser.Entity) {
//         const emailAddress = user.information.email;
//         const fulfilledDemands = this.originEventsStore.getFulfilledDemands(user.id);

//         if (fulfilledDemands.length > 0) {
//             await this.sendNotificationEmail(
//                 EmailTypes.DEMAND_FULFILLED,
//                 emailAddress,
//                 `Your following demand(s) have been fulfilled:<br />${fulfilledDemands
//                     .map(demandId => `Demand #${demandId}.`)
//                     .join('<br />')}`,
//                 () => this.originEventsStore.resetFulfilledDemands(user.id)
//             );
//         }
//     }

//     private async notifyPartiallyFilledDemand(user: MarketUser.Entity) {
//         const emailAddress = user.information.email;
//         const partiallyFilledDemands = this.originEventsStore.getPartiallyFilledDemands(user.id);

//         if (partiallyFilledDemands.length > 0) {
//             await this.sendNotificationEmail(
//                 EmailTypes.DEMAND_PARTIALLY_FILLED,
//                 emailAddress,
//                 `Matched the following certificates to your demands:<br />${partiallyFilledDemands
//                     .map(
//                         match =>
//                             `Matched certificate ${match.certificateId} with amount ${match.energy} Wh to demand ${match.demandId}.`
//                     )
//                     .join('<br />')}`,
//                 () => this.originEventsStore.resetPartiallyFilledDemands(user.id)
//             );
//         }
//     }

//     private async notifyMatchingCertificates(user: MarketUser.Entity) {
//         const emailAddress = user.information.email;
//         const matchingCertificates = this.originEventsStore.getMatchingCertificates(user.id);

//         if (matchingCertificates.length > 0) {
//             let urls = matchingCertificates.map(
//                 match => `${process.env.UI_BASE_URL}/certificates/for_demand/${match.demandId}`
//             );
//             urls = urls.filter((url, index) => urls.indexOf(url) === index); // Remove duplicate urls

//             await this.sendNotificationEmail(
//                 EmailTypes.FOUND_MATCHING_SUPPLY,
//                 emailAddress,
//                 `We found ${
//                     matchingCertificates.length
//                 } certificates matching your demands. Open Origin and check it out:${urls.map(
//                     url => `<br /><a href="${url}">${url}</a>`
//                 )}`,
//                 () => this.originEventsStore.resetMatchingCertificates(user.id)
//             );
//         }
//     }

//     private async notifyIssuedCertificates(user: MarketUser.Entity) {
//         const emailAddress = user.information.email;
//         const issuedCertificates = this.originEventsStore.getIssuedCertificates(user.id);

//         if (issuedCertificates > 0) {
//             const url = `${process.env.UI_BASE_URL}/certificates/inbox`;

//             await this.sendNotificationEmail(
//                 EmailTypes.CERTS_APPROVED,
//                 emailAddress,
//                 `Local issuer approved your certificates.<br />There are ${issuedCertificates} new certificates in your inbox:<br /><a href="${url}">${url}</a>`,
//                 () => this.originEventsStore.resetIssuedCertificates(user.id)
//             );
//         }
//     }

//     private async notifyDeviceStatusChange(user: MarketUser.Entity) {
//         const emailAddress = user.information.email;
//         const deviceStatusChanges = this.originEventsStore.getDeviceStatusChanges(user.id);

//         if (deviceStatusChanges.length > 0) {
//             const url = `${process.env.UI_BASE_URL}/devices/owned`;

//             await this.sendNotificationEmail(
//                 EmailTypes.DEVICE_STATUS_CHANGED,
//                 emailAddress,
//                 `Your following devices have had their status changed:<br />${deviceStatusChanges
//                     .map(
//                         deviceStatusChange =>
//                             `Device #${deviceStatusChange.deviceId}: ${deviceStatusChange.status}`
//                     )
//                     .join('<br />')}<br /><a href="${url}">${url}</a>`,
//                 () => this.originEventsStore.resetDeviceStatusChanges(user.id)
//             );
//         }
//     }

//     private async notifyOrganizationStatusChange(emailAddress: string) {
//         const organizationStatusChanges = this.originEventsStore.getOrganizationStatusChanges(
//             emailAddress
//         );

//         if (organizationStatusChanges.length > 0) {
//             for (const change of organizationStatusChanges) {
//                 const url = `${process.env.UI_BASE_URL}/organization/organization-view/${change.organizationId}`;

//                 await this.sendNotificationEmail(
//                     EmailTypes.ORGANIZATION_STATUS_CHANGES,
//                     emailAddress,
//                     `Status of your registration changed to ${
//                         OrganizationStatus[change.status]
//                     }. To find out more please visit <a href="${url}">${url}</a>`,
//                     () => this.originEventsStore.resetOrganizationStatusChanges(emailAddress)
//                 );
//             }
//         }
//     }

//     private async notifyOrganizationInvitation(emailAddress: string) {
//         const organizationInvitations = this.originEventsStore.getOrganizationInvitations(
//             emailAddress
//         );

//         if (organizationInvitations.length > 0) {
//             for (const invitation of organizationInvitations) {
//                 const url = `${process.env.UI_BASE_URL}/organization/organization-invitations`;

//                 await this.sendNotificationEmail(
//                     EmailTypes.ORGANIZATION_INVITATION,
//                     emailAddress,
//                     `Organization ${invitation.organizationName} has invited you to join the organization. To accept the invitation, please visit <a href="${url}">${url}</a>`,
//                     () => this.originEventsStore.resetOrganizationInvitations(emailAddress)
//                 );
//             }
//         }
//     }

//     private async notifyOrganizationRemovedMember(emailAddress: string) {
//         const organizationRemovedMember = this.originEventsStore.getOrganizationRemovedMember(
//             emailAddress
//         );

//         if (organizationRemovedMember.length > 0) {
//             for (const removed of organizationRemovedMember) {
//                 await this.sendNotificationEmail(
//                     EmailTypes.ORGANIZATION_REMOVED_MEMBER,
//                     emailAddress,
//                     `Organization ${removed.organizationName} has removed you from the organization.`,
//                     () => this.originEventsStore.resetOrganizationRemovedMembers(emailAddress)
//                 );
//             }
//         }
//     }

//     private async sendNotificationEmail(
//         notificationType: EmailTypes,
//         emailAddress: string,
//         html: string,
//         callback: () => void
//     ) {
//         this.conf.logger.info(`Sending "${notificationType}" email to ${emailAddress}...`);

//         await this.emailService.send(
//             {
//                 to: [emailAddress],
//                 subject: `[Origin] ${notificationType}`,
//                 html
//             },
//             () => {
//                 callback();
//                 this.conf.logger.info(`Sent "${notificationType}" email to ${emailAddress}.`);
//             }
//         );
//     }
// }
