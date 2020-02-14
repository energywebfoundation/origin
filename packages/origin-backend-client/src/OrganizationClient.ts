import {
    OrganizationPostData,
    OrganizationUpdateData,
    OrganizationInviteCreateData,
    OrganizationInviteCreateReturnData,
    IOrganizationInvitation,
    OrganizationInviteUpdateData,
    OrganizationInvitationStatus,
    IOrganizationWithRelationsIds,
    IUserWithRelationsIds,
    OrganizationRemoveMemberReturnData
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export interface IOrganizationClient {
    getById(id: number): Promise<IOrganizationWithRelationsIds>;
    getAll(): Promise<IOrganizationWithRelationsIds[]>;
    add(data: OrganizationPostData): Promise<IOrganizationWithRelationsIds>;
    update(id: number, data: OrganizationUpdateData): Promise<IOrganizationWithRelationsIds>;

    invite(email: string): Promise<OrganizationInviteCreateReturnData>;
    getInvitations(): Promise<IOrganizationInvitation[]>;
    getInvitationsToOrganization(organizationId: number): Promise<IOrganizationInvitation[]>;
    getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]>;
    acceptInvitation(id: number): Promise<any>;
    rejectInvitation(id: number): Promise<any>;

    getMembers(id: number): Promise<IUserWithRelationsIds[]>;
    removeMember(
        organizationId: number,
        userId: number
    ): Promise<OrganizationRemoveMemberReturnData>;
}

export class OrganizationClient implements IOrganizationClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get endpoint() {
        return `${this.dataApiUrl}/Organization`;
    }

    public async getById(id: number): Promise<IOrganizationWithRelationsIds> {
        if (typeof id === 'undefined') {
            return null;
        }

        const url = `${this.endpoint}/${id}`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async getAll(): Promise<IOrganizationWithRelationsIds[]> {
        const { data } = await this.requestClient.get(this.endpoint);

        return data;
    }

    public async add(data: OrganizationPostData): Promise<IOrganizationWithRelationsIds> {
        const response = await this.requestClient.post<
            OrganizationPostData,
            IOrganizationWithRelationsIds
        >(this.endpoint, data);

        return response.data;
    }

    public async update(
        id: number,
        data: OrganizationUpdateData
    ): Promise<IOrganizationWithRelationsIds> {
        const response = await this.requestClient.put<
            OrganizationUpdateData,
            IOrganizationWithRelationsIds
        >(`${this.endpoint}/${id}`, data);

        return response.data;
    }

    public async acceptInvitation(id: number): Promise<any> {
        return this.updateInvitation(id, {
            status: OrganizationInvitationStatus.Accepted
        });
    }

    public async rejectInvitation(id: number): Promise<any> {
        return this.updateInvitation(id, {
            status: OrganizationInvitationStatus.Rejected
        });
    }

    public async invite(email: string): Promise<OrganizationInviteCreateReturnData> {
        const response = await this.requestClient.post<
            OrganizationInviteCreateData,
            OrganizationInviteCreateReturnData
        >(`${this.endpoint}/invite`, {
            email
        });

        return response.data;
    }

    public async getInvitations(): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get(`${this.endpoint}/invitation`);

        return data;
    }

    public async getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get(
            `${this.endpoint}/invitation?email=${encodeURIComponent(email)}`
        );

        return data;
    }

    public async getInvitationsToOrganization(
        organizationId: number
    ): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get(
            `${this.endpoint}/invitation?organization=${organizationId}`
        );

        return data;
    }

    public async getMembers(id: number): Promise<IUserWithRelationsIds[]> {
        const { data } = await this.requestClient.get(`${this.endpoint}/${id}/users`);

        return data;
    }

    public async removeMember(
        organizationId: number,
        userId: number
    ): Promise<{ success: boolean; error: string }> {
        const response = await this.requestClient.post<{}, { success: boolean; error: string }>(
            `${this.endpoint}/${organizationId}/remove-member/${userId}`
        );

        return response.data;
    }

    private async updateInvitation(id: number, data: OrganizationInviteUpdateData): Promise<any> {
        const response = await this.requestClient.put<
            OrganizationInviteUpdateData,
            IOrganizationInvitation
        >(`${this.endpoint}/invitation/${id}`, data);

        return response.data;
    }
}
