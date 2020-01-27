import { Device } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { MarketUser } from '@energyweb/market';

import { IOriginEventsStore } from '../stores/OriginEventsStore';

import EmailTypes from '../email/EmailTypes';
import { IEmailServiceProvider } from './email.service';

export interface INotificationService {
    notify(): Promise<void>;
}

export class NotificationService implements INotificationService {
    constructor(
        private conf: Configuration.Entity,
        private emailService: IEmailServiceProvider,
        private originEventsStore: IOriginEventsStore
    ) {}

    public async notify() {
        const allUsers: Promise<
            MarketUser.Entity
        >[] = this.originEventsStore
            .getAllUsers()
            .map(async userId => new MarketUser.Entity(userId, this.conf).sync());

        const notifyUsers: MarketUser.Entity[] = (await Promise.all(allUsers)).filter(
            user => user.offChainProperties.notifications
        );

        for (const user of notifyUsers) {
            await this.notifyIssuedCertificates(user);
            await this.notifyMatchingCertificates(user);
            await this.notifyPartiallyFilledDemand(user);
            await this.notifyFulfilledDemand(user);
            await this.notifyDeviceStatusChange(user);
        }
    }

    private async notifyFulfilledDemand(user: MarketUser.Entity) {
        const emailAddress = user.information.email;
        const fulfilledDemands = this.originEventsStore.getFulfilledDemands(user.id);

        if (fulfilledDemands.length > 0) {
            await this.sendNotificationEmail(
                EmailTypes.DEMAND_FULFILLED,
                emailAddress,
                `Your following demand(s) have been fulfilled:<br />${fulfilledDemands
                    .map(demandId => `Demand #${demandId}.`)
                    .join('<br />')}`,
                () => this.originEventsStore.resetFulfilledDemands(user.id)
            );
        }
    }

    private async notifyPartiallyFilledDemand(user: MarketUser.Entity) {
        const emailAddress = user.information.email;
        const partiallyFilledDemands = this.originEventsStore.getPartiallyFilledDemands(user.id);

        if (partiallyFilledDemands.length > 0) {
            await this.sendNotificationEmail(
                EmailTypes.DEMAND_PARTIALLY_FILLED,
                emailAddress,
                `Matched the following certificates to your demands:<br />${partiallyFilledDemands
                    .map(
                        match =>
                            `Matched certificate ${match.certificateId} with amount ${match.amount} Wh to demand ${match.demandId}.`
                    )
                    .join('<br />')}`,
                () => this.originEventsStore.resetPartiallyFilledDemands(user.id)
            );
        }
    }

    private async notifyMatchingCertificates(user: MarketUser.Entity) {
        const emailAddress = user.information.email;
        const matchingCertificates = this.originEventsStore.getMatchingCertificates(user.id);

        if (matchingCertificates.length > 0) {
            let urls = matchingCertificates.map(
                match => `${process.env.UI_BASE_URL}/certificates/for_demand/${match.demandId}`
            );
            urls = urls.filter((url, index) => urls.indexOf(url) === index); // Remove duplicate urls

            await this.sendNotificationEmail(
                EmailTypes.FOUND_MATCHING_SUPPLY,
                emailAddress,
                `We found ${
                    matchingCertificates.length
                } certificates matching your demands. Open Origin and check it out:${urls.map(
                    url => `<br /><a href="${url}">${url}</a>`
                )}`,
                () => this.originEventsStore.resetMatchingCertificates(user.id)
            );
        }
    }

    private async notifyIssuedCertificates(user: MarketUser.Entity) {
        const emailAddress = user.information.email;
        const issuedCertificates = this.originEventsStore.getIssuedCertificates(user.id);

        if (issuedCertificates > 0) {
            const url = `${process.env.UI_BASE_URL}/certificates/inbox`;

            await this.sendNotificationEmail(
                EmailTypes.CERTS_APPROVED,
                emailAddress,
                `Local issuer approved your certificates.<br />There are ${issuedCertificates} new certificates in your inbox:<br /><a href="${url}">${url}</a>`,
                () => this.originEventsStore.resetIssuedCertificates(user.id)
            );
        }
    }

    private async notifyDeviceStatusChange(user: MarketUser.Entity) {
        const emailAddress = user.information.email;
        const deviceStatusChanges = this.originEventsStore.getDeviceStatusChanges(user.id);

        if (deviceStatusChanges.length > 0) {
            const url = `${process.env.UI_BASE_URL}/devices/owned`;

            await this.sendNotificationEmail(
                EmailTypes.DEVICE_STATUS_CHANGED,
                emailAddress,
                `Your following devices have had their status changed:<br />${deviceStatusChanges
                    .map(
                        deviceStatusChange =>
                            `Device #${deviceStatusChange.deviceId}: ${
                                Device.DeviceStatus[parseInt(deviceStatusChange.status, 10)]
                            }`
                    )
                    .join('<br />')}<br /><a href="${url}">${url}</a>`,
                () => this.originEventsStore.resetDeviceStatusChanges(user.id)
            );
        }
    }

    private async sendNotificationEmail(
        notificationType: EmailTypes,
        emailAddress: string,
        html: string,
        callback: () => void
    ) {
        this.conf.logger.info(`Sending "${notificationType}" email to ${emailAddress}...`);

        await this.emailService.send(
            {
                to: [emailAddress],
                subject: `[Origin] ${notificationType}`,
                html
            },
            () => {
                callback();
                this.conf.logger.info(`Sent "${notificationType}" email to ${emailAddress}.`);
            }
        );
    }
}
