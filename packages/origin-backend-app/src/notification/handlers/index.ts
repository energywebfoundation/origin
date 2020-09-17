import { DeviceStatusChangedHandler } from './device-status-changed.handler';
import { EmailConfirmationRequestedHandler } from './email-confirmation-requested.handler';
import { InvitationCreatedHandler } from './invitation-created.handler';
import { OrganizationMemberRemovedHandler } from './organization-member-removed.handler';
import { OrganizationMemberRoleChangedHandler } from './organization-member-role-changed.handler';
import { OrganizationStatusChangedHandler } from './organization-status-changed.handler';

export const Handlers = [
    DeviceStatusChangedHandler,
    EmailConfirmationRequestedHandler,
    InvitationCreatedHandler,
    OrganizationMemberRemovedHandler,
    OrganizationMemberRoleChangedHandler,
    OrganizationStatusChangedHandler
];
