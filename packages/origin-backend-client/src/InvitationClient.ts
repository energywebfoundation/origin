import { 
    OrganizationInviteCreateData,
    ISuccessResponse,
    IOrganizationInvitation,
    OrganizationInviteUpdateData,
    OrganizationInvitationStatus,
    OrganizationRole,
    IRequestClient,
    } from '@energyweb/origin-backend-core';
import { IInvitationClient } from '../../origin-backend-core/dist/js/src/client/index';
import { RequestClient } from './RequestClient';

export class InvitationClient implements IInvitationClient { 
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}
    
    private get endpoint() {
        return `${this.dataApiUrl}/invitation`;
    }

    public async invite(email: string, role: OrganizationRole): Promise<ISuccessResponse> {
        const response = await this.requestClient.post<
            OrganizationInviteCreateData,
            ISuccessResponse
        >(`${this.endpoint}`, {
            email,
            role
        });

        return response.data;
    }

    public async getInvitations(): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get<unknown, IOrganizationInvitation[]>(
            `${this.endpoint}`
        );

        return data;
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

    private async updateInvitation(id: number, data: OrganizationInviteUpdateData): Promise<any> {
        const response = await this.requestClient.put<
            OrganizationInviteUpdateData,
            IOrganizationInvitation
        >(`${this.endpoint}/${id}`, data);

        return response.data;
    }
    
    public async getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]> {
        const { data } = await this.requestClient.get<unknown, IOrganizationInvitation[]>(
            `${this.endpoint}?email=${encodeURIComponent(email)}`
        );

        return data;
    }

}
