import {
    ILoggedInUser,
    ISuccessResponse,
    OrganizationInvitationStatus,
    OrganizationRole,
    ResponseSuccess
} from '@energyweb/origin-backend-core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../organization/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { UserService } from '../user';
import { AlreadyPartOfOrganizationError } from './errors/already-part-of-organization.error';
import { InvitationCreatedEvent } from './events';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationService {
    private readonly logger = new Logger(InvitationService.name);

    constructor(
        private readonly organizationService: OrganizationService,
        @InjectRepository(Invitation)
        private readonly invitationRepository: Repository<Invitation>,
        private readonly userService: UserService,
        private readonly eventBus: EventBus
    ) {}

    public async invite(user: ILoggedInUser, email: string, role: OrganizationRole): Promise<void> {
        const sender = await this.userService.findByEmail(user.email);
        const organization = await this.organizationService.findOne(user.organizationId);

        const lowerCaseEmail = email.toLowerCase();

        const invitee = await this.userService.findByEmail(lowerCaseEmail);

        if (invitee && invitee.organization) {
            throw new AlreadyPartOfOrganizationError(lowerCaseEmail);
        }

        this.ensureIsNotMember(lowerCaseEmail, organization);

        await this.invitationRepository.save({
            email: lowerCaseEmail,
            organization,
            role,
            status: OrganizationInvitationStatus.Pending,
            sender: `${sender.firstName} ${sender.lastName}`
        });

        this.eventBus.publish(new InvitationCreatedEvent(organization, lowerCaseEmail));
    }

    public async update(
        user: ILoggedInUser,
        invitationId: string,
        status: OrganizationInvitationStatus
    ): Promise<ISuccessResponse> {
        this.logger.debug(`User with userId=${user.id} requested invitationId=${invitationId}`);

        const lowerCaseEmail = user.email.toLowerCase();

        const invitation = await this.invitationRepository.findOne(invitationId, {
            where: {
                email: lowerCaseEmail
            },
            relations: ['organization']
        });

        if (!invitation) {
            throw new BadRequestException('Requested invitation does not exist');
        }

        if (
            invitation.status === OrganizationInvitationStatus.Accepted ||
            invitation.status === OrganizationInvitationStatus.Rejected
        ) {
            throw new BadRequestException(
                'Requested invitation has already been accepted or rejected'
            );
        }

        if (status === OrganizationInvitationStatus.Accepted) {
            await this.userService.addToOrganization(user.id, invitation.organization.id);
            await this.userService.changeRole(user.id, invitation.role);
        }

        invitation.status = status;

        await this.invitationRepository.save(invitation);

        return ResponseSuccess();
    }

    public async getUsersInvitation(email: string): Promise<Invitation[]> {
        const lowerCaseEmail = email.toLowerCase();

        return this.invitationRepository.find({
            where: { email: lowerCaseEmail },
            relations: ['organization']
        });
    }

    private ensureIsNotMember(email: string, organization: Organization) {
        const lowerCaseEmail = email.toLowerCase();

        if (organization.users.find((u) => u.email === lowerCaseEmail)) {
            throw new BadRequestException({
                success: false,
                error: `Invited user already belongs to this organization.`
            });
        }

        if (organization.invitations.find((u) => u.email === lowerCaseEmail)) {
            throw new BadRequestException({
                success: false,
                error: `User has already been invited to this organization.`
            });
        }
    }
}
