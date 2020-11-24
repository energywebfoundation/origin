import { plainToClass } from 'class-transformer';
import { InvitationDTO } from '../invitation/invitation.dto';
import { Invitation } from '../invitation/invitation.entity';

export class OrganizationInvitationDTO extends InvitationDTO {
    public static fromInvitation(invitation: Invitation): OrganizationInvitationDTO {
        return plainToClass(OrganizationInvitationDTO, invitation, {
            excludeExtraneousValues: true
        });
    }
}
