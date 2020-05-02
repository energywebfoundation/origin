import { Injectable, Logger } from '@nestjs/common';
import {
    SupportedEvents,
    OrganizationInvitationEvent,
    OrganizationStatusChangedEvent,
    NewEvent,
    OrganizationStatus,
    OrganizationRemovedMemberEvent,
    DeviceStatusChangedEvent,
    DeviceStatus,
    UserStatusChangedEvent
} from '@energyweb/origin-backend-core';
import { MailService } from '../mail';
import EmailTypes from './EmailTypes';

const SUPPORTED_EVENTS = [
    SupportedEvents.ORGANIZATION_INVITATION,
    SupportedEvents.ORGANIZATION_STATUS_CHANGED,
    SupportedEvents.ORGANIZATION_REMOVED_MEMBER,
    SupportedEvents.DEVICE_STATUS_CHANGED,
    SupportedEvents.USER_STATUS_CHANGED
];

type TSupportedNotificationEvent = {
    type:
        | SupportedEvents.USER_STATUS_CHANGED
        | SupportedEvents.ORGANIZATION_INVITATION
        | SupportedEvents.ORGANIZATION_STATUS_CHANGED
        | SupportedEvents.ORGANIZATION_REMOVED_MEMBER
        | SupportedEvents.DEVICE_STATUS_CHANGED;
    data:
        | UserStatusChangedEvent
        | OrganizationInvitationEvent
        | OrganizationStatusChangedEvent
        | OrganizationRemovedMemberEvent
        | DeviceStatusChangedEvent;
};

function assertIsSupportedEvent(event: NewEvent): asserts event is TSupportedNotificationEvent {
    if (!SUPPORTED_EVENTS.includes(event.type)) {
        throw new Error(`Event is not supported: ${event.type}`);
    }
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(private readonly mailService: MailService) {}

    private handlers = {
        [SupportedEvents.ORGANIZATION_INVITATION]: async (data: OrganizationInvitationEvent) => {
            const url = `${process.env.UI_BASE_URL}/organization/organization-invitations`;

            await this.sendNotificationEmail(
                EmailTypes.ORGANIZATION_INVITATION,
                data.email,
                `Organization ${data.organizationName} has invited you to join the organization. To accept the invitation, please visit <a href="${url}">${url}</a>`
            );
        },
        [SupportedEvents.ORGANIZATION_STATUS_CHANGED]: async (
            data: OrganizationStatusChangedEvent
        ) => {
            const url = `${process.env.UI_BASE_URL}/organization/organization-view/${data.organizationId}`;

            await this.sendNotificationEmail(
                EmailTypes.ORGANIZATION_STATUS_CHANGED,
                data.organizationEmail,
                `Status of your registration changed to ${
                    OrganizationStatus[data.status]
                }. To find out more please visit <a href="${url}">${url}</a>`
            );
        },
        [SupportedEvents.ORGANIZATION_REMOVED_MEMBER]: async (
            data: OrganizationRemovedMemberEvent
        ) => {
            await this.sendNotificationEmail(
                EmailTypes.ORGANIZATION_REMOVED_MEMBER,
                data.email,
                `Organization ${data.organizationName} has removed you from the organization.`
            );
        },
        [SupportedEvents.DEVICE_STATUS_CHANGED]: async (data: DeviceStatusChangedEvent) => {
            const url = `${process.env.UI_BASE_URL}/devices/owned`;

            await this.sendNotificationEmail(
                EmailTypes.DEVICE_STATUS_CHANGED,
                data.deviceManagersEmails,
                `Your device with id: "${data.deviceId}" has had its status changed to "${
                    DeviceStatus[data.status]
                }".<br /><br /><a href="${url}">${url}</a>`
            );
        },
        [SupportedEvents.USER_STATUS_CHANGED]: async (data: UserStatusChangedEvent) => {
            await this.sendNotificationEmail(
                EmailTypes.USER_STATUS_CHANGED,
                data.email,
                `Status of your user information`
            );
        }
    };

    async handleEvent(event: NewEvent) {
        try {
            assertIsSupportedEvent(event);

            return this.handlers[event.type](
                (event.data as TSupportedNotificationEvent['data']) as any
            );
        } catch {
            return false;
        }
    }

    private async sendNotificationEmail(
        notificationType: EmailTypes,
        emailAddress: string | string[],
        html: string
    ) {
        this.logger.log(`Sending "${notificationType}" email to ${emailAddress}...`);

        const emails = Array.isArray(emailAddress) ? emailAddress : [emailAddress];

        const result = await this.mailService.send({
            to: emails,
            subject: `[Origin] ${notificationType}`,
            html
        } as any);

        if (result) {
            this.logger.log(`Sent "${notificationType}" email to ${emailAddress}.`);
        } else {
            this.logger.error(`Can't send e-mail "${notificationType}"`);
        }

        return result;
    }
}
