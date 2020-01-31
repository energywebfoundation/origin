import {
    IOrganizationWithRelationsIds,
    OrganizationPostData,
    OrganizationUpdateData,
    OrganizationInviteCreateReturnData,
    IOrganizationInvitation,
    OrganizationStatus,
    OrganizationRemoveMemberReturnData,
    IUserWithRelationsIds
} from '@energyweb/origin-backend-core';

import { IOrganizationClient } from '@energyweb/origin-backend-client';

export class OrganizationClientMock implements IOrganizationClient {
    getMembers(id: number): Promise<IUserWithRelationsIds[]> {
        throw new Error('Method not implemented.');
    }

    removeMember(
        organizationId: number,
        userId: number
    ): Promise<OrganizationRemoveMemberReturnData> {
        throw new Error('Method not implemented.');
    }

    private storage = new Map<number, IOrganizationWithRelationsIds>();

    private idCounter = 0;

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
            ...data
        };

        this.storage.set(organization.id, organization);

        return organization;
    }

    update(id: number, data: OrganizationUpdateData): Promise<IOrganizationWithRelationsIds> {
        throw new Error('Method not implemented.');
    }

    invite(email: string): Promise<OrganizationInviteCreateReturnData> {
        throw new Error('Method not implemented.');
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

    acceptInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }

    rejectInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
