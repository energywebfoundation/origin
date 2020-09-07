import {
    OrganizationPostData,
    OrganizationUpdateData,
    OrganizationInviteCreateData,
    ISuccessResponse,
    IOrganizationInvitation,
    OrganizationInviteUpdateData,
    OrganizationInvitationStatus,
    OrganizationRole,
    Role,
    IOrganizationUpdateMemberRole,
    IRequestClient,
    IOrganizationClient,
    IUser,
    IFullOrganization
} from '@energyweb/origin-backend-core';

import { RequestClient } from './RequestClient';

export class OrganizationClient implements IOrganizationClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get endpoint() {
        return `${this.dataApiUrl}/Organization`;
    }

    public async getById(id: number): Promise<IFullOrganization> {
        if (typeof id === 'undefined') {
            return null;
        }

        const url = `${this.endpoint}/${id}`;
        const { data } = await this.requestClient.get<unknown, IFullOrganization>(url);

        return data;
    }

    public async getAll(): Promise<IFullOrganization[]> {
        const { data } = await this.requestClient.get<unknown, IFullOrganization[]>(this.endpoint);

        return data;
    }

    public async add(data: OrganizationPostData): Promise<IFullOrganization> {
        const response = await this.requestClient.post<OrganizationPostData, IFullOrganization>(
            this.endpoint,
            data
        );

        return response.data;
    }

    public async update(id: number, data: OrganizationUpdateData): Promise<IFullOrganization> {
        const response = await this.requestClient.put<OrganizationUpdateData, IFullOrganization>(
            `${this.endpoint}/${id}`,
            data
        );

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

    public async viewInvitation(id: number): Promise<any> {
        await this.updateInvitation(id, {
            status: OrganizationInvitationStatus.Viewed
        });
    }

    public async invite(email: string, role: OrganizationRole): Promise<ISuccessResponse> {
        const response = await this.requestClient.post<
            OrganizationInviteCreateData,
            ISuccessResponse
        >(`${this.endpoint}/invite`, {
            email,
            role
        });

        return response.data;
    }

    public async getInvitations(): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get<unknown, IOrganizationInvitation[]>(
            `${this.endpoint}/invitation`
        );

        return data;
    }

    public async getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get<unknown, IOrganizationInvitation[]>(
            `${this.endpoint}/invitation?email=${encodeURIComponent(email)}`
        );

        return data;
    }

    public async getInvitationsToOrganization(
        organizationId: number
    ): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get<unknown, IOrganizationInvitation[]>(
            `${this.endpoint}/${organizationId}/invitations`
        );

        return data;
    }

    public async getMembers(id: number): Promise<IUser[]> {
        const { data } = await this.requestClient.get<unknown, IUser[]>(
            `${this.endpoint}/${id}/users`
        );

        return data;
    }

    public async removeMember(organizationId: number, userId: number): Promise<ISuccessResponse> {
        const response = await this.requestClient.post<void, ISuccessResponse>(
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

    public async memberChangeRole(
        organizationId: number,
        userId: number,
        newRole: Role
    ): Promise<ISuccessResponse> {
        const response = await this.requestClient.put<
            IOrganizationUpdateMemberRole,
            ISuccessResponse
        >(`${this.endpoint}/${organizationId}/change-role/${userId}`, { role: newRole });

        return response.data;
    }
}
