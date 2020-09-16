import {
    IOrganizationInvitation,
    IUser,
    ISuccessResponse,
    OrganizationPostData,
    OrganizationStatus,
    OrganizationUpdateData,
    Role,
    IOrganizationClient,
    IFullOrganization
} from '@energyweb/origin-backend-core';

export class OrganizationClientMock implements IOrganizationClient {
    private storage = new Map<number, IFullOrganization>();

    private idCounter = 0;

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

    getInvitationsForOrganization(organizationId: number): Promise<IOrganizationInvitation[]> {
        throw new Error('Method not implemented.');
    }

}
