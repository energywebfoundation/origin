import moment from 'moment';
import {
    IOrganizationWithRelationsIds,
    OrganizationPostData,
    OrganizationUpdateData,
    OrganizationInviteCreateReturnData,
    IOrganizationInvitation,
    OrganizationStatus,
    OrganizationRemoveMemberReturnData,
    IUserWithRelationsIds,
    OrganizationStatusChangedEvent,
    IEvent,
    SupportedEvents,
    OrganizationInvitationStatus,
    OrganizationInvitationEvent,
    OrganizationRemovedMember
} from '@energyweb/origin-backend-core';

import { IOrganizationClient, IEventClient } from '@energyweb/origin-backend-client';

interface ITmpUser {
    id: number;
    email: string;
}

export class OrganizationClientMock implements IOrganizationClient {
    constructor(public eventClient: IEventClient) {}

    private storage = new Map<number, IOrganizationWithRelationsIds>();

    private invitationStorage = new Map<number, IOrganizationInvitation>();

    private userStorage: ITmpUser[] = [];

    private idCounter = 0;

    private invitationCounter = 0;

    private userCounter = 0;

    async getById(id: number): Promise<IOrganizationWithRelationsIds> {
        return this.storage.get(id);
    }

    async getAll(): Promise<IOrganizationWithRelationsIds[]> {
        return [...this.storage.values()];
    }

    async add(data: OrganizationPostData): Promise<IOrganizationWithRelationsIds> {
        this.idCounter++;

        const organization: IOrganizationWithRelationsIds = {
            id: this.idCounter,
            status: OrganizationStatus.Submitted,
            leadUser: null,
            users: [],
            devices: [],
            ...data
        };

        this.storage.set(organization.id, organization);

        return organization;
    }

    addMocked(data: OrganizationPostData, leadUserId: number): IOrganizationWithRelationsIds {
        this.idCounter++;

        const organization: IOrganizationWithRelationsIds = {
            id: this.idCounter,
            status: OrganizationStatus.Submitted,
            leadUser: leadUserId,
            users: [leadUserId],
            devices: [],
            ...data
        };

        this.storage.set(organization.id, organization);

        return organization;
    }

    update(id: number, data: OrganizationUpdateData): Promise<IOrganizationWithRelationsIds> {
        const organization = this.storage.get(id);

        Object.assign(organization, data);

        this.storage.set(id, organization);

        const eventData: OrganizationStatusChangedEvent = {
            organizationId: id,
            organizationEmail: organization.email,
            status: data.status
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.ORGANIZATION_STATUS_CHANGED,
            data: eventData,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        return Promise.resolve(organization);
    }

    invite(email: string): Promise<OrganizationInviteCreateReturnData> {
        throw new Error('Method not implemented.');
    }

    inviteMocked(email: string, organizationId: number): OrganizationInviteCreateReturnData {
        const organization = this.storage.get(organizationId);
        this.invitationCounter++;

        const organizationInvitation: IOrganizationInvitation = {
            id: this.invitationCounter,
            email,
            organization: organizationId,
            status: OrganizationInvitationStatus.Pending
        };

        this.invitationStorage.set(organizationInvitation.id, organizationInvitation);

        const eventData: OrganizationInvitationEvent = {
            organizationName: organization.name,
            email
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.ORGANIZATION_INVITATION,
            data: eventData,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        this.userCounter++;
        this.userStorage.push({
            id: this.userCounter,
            email
        });

        return {
            success: true,
            error: organizationInvitation.id.toString()
        };
    }

    getMembers(id: number): Promise<IUserWithRelationsIds[]> {
        throw new Error('Method not implemented.');
    }

    removeMember(
        organizationId: number,
        userId: number
    ): Promise<OrganizationRemoveMemberReturnData> {
        const organization = this.storage.get(organizationId);

        organization.users = organization.users.filter(user => user !== userId);

        this.storage.set(organization.id, organization);

        const eventData: OrganizationRemovedMember = {
            organizationName: organization.name,
            email: this.userStorage.find(user => user.id === userId).email
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.ORGANIZATION_REMOVED_MEMBER,
            data: eventData,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        const returnData: OrganizationRemoveMemberReturnData = {
            success: true,
            error: ''
        };

        return Promise.resolve(returnData);
    }

    getInvitations(): Promise<IOrganizationInvitation[]> {
        throw new Error('Method not implemented.');
    }

    getInvitationsToOrganization(organizationId: number): Promise<IOrganizationInvitation[]> {
        throw new Error('Method not implemented.');
    }

    getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]> {
        throw new Error('Method not implemented.');
    }

    acceptInvitation(invitationId: number): Promise<any> {
        const invitation = this.invitationStorage.get(invitationId);
        const organization = this.storage.get(invitation.organization as number);
        const user = this.userStorage.find(user => user.email === invitation.email);

        invitation.status = OrganizationInvitationStatus.Accepted;

        organization.users.push(user.id);

        const eventData: OrganizationInvitationEvent = {
            organizationName: organization.name,
            email: invitation.email
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.ORGANIZATION_INVITATION,
            data: eventData,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        this.invitationStorage.set(invitationId, invitation);
        this.storage.set(organization.id, organization);

        return null;
    }

    rejectInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
