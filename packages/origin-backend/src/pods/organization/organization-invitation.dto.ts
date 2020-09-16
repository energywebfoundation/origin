import { OrganizationInvitationStatus, OrganizationRole } from '@energyweb/origin-backend-core';
import { Expose, plainToClass } from 'class-transformer';
import { Invitation } from '../invitation/invitation.entity';

export class OrganizationInvitationDTO {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    role: OrganizationRole;

    @Expose()
    status: OrganizationInvitationStatus;

    @Expose()
    sender: string;

    public static fromInvitation(invitation: Invitation): OrganizationInvitationDTO {
        return plainToClass(OrganizationInvitationDTO, invitation, {
            excludeExtraneousValues: true
        });
    }
}
