import {
    ILoggedInUser,
    OrganizationInvitationEvent,
    OrganizationInvitationStatus,
    SupportedEvents,
    OrganizationRole
} from '@energyweb/origin-backend-core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail, isString } from 'class-validator';
import { Repository, In, Not } from 'typeorm';

import { NotificationService } from '../notification';
import { Organization } from './organization.entity';
import { OrganizationInvitation } from './organization-invitation.entity';
import { UserService } from '../user';

@Injectable()
export class OrganizationInvitationService {
    private readonly logger = new Logger(OrganizationInvitationService.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(OrganizationInvitation)
        private readonly invitationRepository: Repository<OrganizationInvitation>,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService
    ) {}

    public async invite(user: ILoggedInUser, email: string, role: OrganizationRole) {
        if (!isEmail(email)) {
            throw new BadRequestException({
                success: false,
                error: 'Provided email address is incorrect'
            });
        }
        const sender = await this.userService.findByEmail(user.email);
        const { organizationId } = user;
        if (typeof organizationId === 'undefined') {
            throw new BadRequestException({
                success: false,
                message: `User doesn't belong to any organization.`
            });
        }

        const organization = await this.organizationRepository.findOne(organizationId, {
            relations: ['invitations', 'users']
        });

        const lowerCaseEmail = email.toLowerCase();

        this.ensureIsNotMember(lowerCaseEmail, organization);

        await this.invitationRepository.save({
            email: lowerCaseEmail,
            organization,
            role,
            status: OrganizationInvitationStatus.Pending,
            sender: `${sender.firstName} ${sender.lastName}`
        });

        const eventData: OrganizationInvitationEvent = {
            email: lowerCaseEmail,
            organizationName: organization.name
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.ORGANIZATION_INVITATION,
            data: eventData
        });

        return {
            success: true
        };
    }

    public async update(
        user: ILoggedInUser,
        invitationId: string,
        status: OrganizationInvitationStatus
    ) {
        this.logger.debug(`User with userId=${user.id} requested invitationId=${invitationId}`);

        if (!isString(invitationId)) {
            throw new BadRequestException('Incorrect invitationId');
        }

        const invitation = await this.invitationRepository.findOne(invitationId, {
            where: {
                email: user.email,
                status: Not(
                    In([
                        OrganizationInvitationStatus.Accepted,
                        OrganizationInvitationStatus.Rejected
                    ])
                )
            },
            relations: ['organization']
        });

        if (!invitation) {
            throw new BadRequestException(
                'Requested invitation does not exist or has already been accepted or rejected'
            );
        }

        if (status === OrganizationInvitationStatus.Accepted) {
            await this.userService.addToOrganization(user.id, invitation.organization.id);
            await this.userService.changeRole(user.id, invitation.role);
        }

        invitation.status = status;

        await this.invitationRepository.save(invitation);
    }

    private ensureIsNotMember(email: string, organization: Organization) {
        if (organization.users.find((u) => u.email === email)) {
            throw new BadRequestException({
                success: false,
                error: `Invited user already belongs to this organization.`
            });
        }

        if (organization.invitations.find((u) => u.email === email)) {
            throw new BadRequestException({
                success: false,
                error: `User has already been invited to this organization.`
            });
        }
    }
}
