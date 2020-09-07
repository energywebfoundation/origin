import {
    IOrganizationInvitation,
    IUser,
    OrganizationInvitationStatus,
    ISuccessResponse,
    OrganizationPostData,
    OrganizationStatus,
    OrganizationUpdateData,
    OrganizationRole,
    Role,
    IOrganizationClient,
    IFullOrganization
} from '@energyweb/origin-backend-core';

interface ITmpUser {
    id: number;
    email: string;
}

export class OrganizationClientMock implements IOrganizationClient {
    private storage = new Map<number, IFullOrganization>();

    private invitationStorage = new Map<number, IOrganizationInvitation>();

    private userStorage: ITmpUser[] = [];

    private idCounter = 0;

    private invitationCounter = 0;

    private userCounter = 0;

    async getById(id: number): Promise<IFullOrganization> {
        return this.storage.get(id);
    }

    async getAll(): Promise<IFullOrganization[]> {
        return [...this.storage.values()];
    }

    async add(data: OrganizationPostData): Promise<IFullOrganization> {
        this.idCounter++;

        const organization: IFullOrganization = {
            id: this.idCounter,
            status: OrganizationStatus.Submitted,
            ...data
        };

        this.storage.set(organization.id, organization);

        return organization;
    }

    update(id: number, data: OrganizationUpdateData): Promise<IFullOrganization> {
        const organization = this.storage.get(id);

        Object.assign(organization, data);

        this.storage.set(id, organization);

        return Promise.resolve(organization);
    }

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

        this.userCounter++;
        this.userStorage.push({
            id: this.userCounter,
            email
        });

        return {
            success: true,
            message: organizationInvitation.id.toString()
        };
    }

    getMembers(id: number): Promise<IUser[]> {
        throw new Error('Method not implemented.');
    }

    removeMember(organizationId: number, userId: number): Promise<ISuccessResponse> {
        throw new Error('Method not implemented.');
    }

    memberChangeRole(
        organizationId: number,
        userId: number,
        newRole: Role
    ): Promise<ISuccessResponse> {
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

    acceptInvitation(invitationId: number): Promise<any> {
        throw new Error('Method not implemented.');
    }

    rejectInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }

    viewInvitation(id: number): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
