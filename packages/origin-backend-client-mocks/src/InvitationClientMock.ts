import {
    IOrganizationInvitation,
    OrganizationInvitationStatus,
    ISuccessResponse,
    OrganizationRole,
    IFullOrganization,
    IInvitationClient
} from '@energyweb/origin-backend-core';

interface ITmpUser {
    id: number;
    email: string;
}

export class InvitationClientMock implements IInvitationClient { 

    private storage = new Map<number, IFullOrganization>();

    private invitationStorage = new Map<number, IOrganizationInvitation>();

    private userStorage: ITmpUser[] = [];
    
    private invitationCounter = 0;

    invite(email: string, role: OrganizationRole): Promise<ISuccessResponse> {
        throw new Error('Method not implemented.');
    }

    inviteMocked(
        email: string,
        organization: IFullOrganization,
        role: OrganizationRole,
        sender: string
    ): ISuccessResponse {
        this.invitationCounter++;
        const organizationInvitation: IOrganizationInvitation = {
            id: this.invitationCounter,
            email,
            role,
            organization,
            status: OrganizationInvitationStatus.Pending,
            sender,
            createdAt: new Date()
        };

        this.invitationStorage.set(organizationInvitation.id, organizationInvitation);


        return {
            success: true,
            message: organizationInvitation.id.toString()
        };
    }

    getInvitations(): Promise<IOrganizationInvitation[]> {
        throw new Error('Method not implemented.');
    }

    getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]> {
        throw new Error('Method not implemented.');
    }

    acceptInvitation(invitationId: number): Promise<any> {
        const invitation = this.invitationStorage.get(invitationId);
        const organization = this.storage.get(invitation.organization.id);
        const user = this.userStorage.find((user) => user.email === invitation.email);

        invitation.status = OrganizationInvitationStatus.Accepted;

        this.invitationStorage.set(invitationId, invitation);
        this.storage.set(organization.id, organization);

        return null;
    }

    rejectInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }

    viewInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }
}