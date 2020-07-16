import {
    UserLoginReturnData,
    UserRegistrationData,
    IUser,
    IUserWithRelationsIds,
    IUserProperties,
    UserStatus,
    KYCStatus,
    Role,
    UserPasswordUpdate,
    IUserWithRelations,
    IEmailConfirmationToken,
    EmailConfirmationResponse,
    ISuccessResponse
} from '@energyweb/origin-backend-core';
import { recoverTypedSignatureAddress } from '@energyweb/utils-general';

import { IUserClient } from '@energyweb/origin-backend-client';

export class UserClientMock implements IUserClient {
    private storage = new Map<number, IUserWithRelationsIds>();

    private userIdCounter = 0;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    login(email: string, password: string): Promise<UserLoginReturnData> {
        throw new Error('Method not implemented.');
    }

    logout(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async register(data: UserRegistrationData): Promise<IUser> {
        this.userIdCounter++;

        const user: IUserWithRelationsIds = {
            id: this.userIdCounter,
            ...data,
            organization: null,
            blockchainAccountAddress: '',
            blockchainAccountSignedMessage: '',
            notifications: false,
            rights: Role.OrganizationAdmin,
            status: UserStatus.Pending,
            kycStatus: KYCStatus.Pending
        };

        this.storage.set(this.userIdCounter, user);

        return user;
    }

    updateMocked(id: number, user: IUserWithRelationsIds) {
        this.storage.set(id, user);
    }

    me(): Promise<IUserWithRelationsIds> {
        return {} as any;
    }

    async getUserById(id: string): Promise<IUserWithRelationsIds> {
        return this.storage.get(Number(id));
    }

    async attachSignedMessage(signedMessage: string, id?: number): Promise<any> {
        const address = await recoverTypedSignatureAddress(
            process.env.REGISTRATION_MESSAGE_TO_SIGN ?? 'I register as Origin user',
            signedMessage
        );

        const user = this.storage.get(id);

        this.storage.set(id, {
            ...user,
            blockchainAccountSignedMessage: signedMessage,
            blockchainAccountAddress: address
        });
    }

    async updateAdditionalProperties(
        properties: Partial<Pick<IUserProperties, 'notifications'>>,
        id?: number
    ): Promise<any> {
        const user = this.storage.get(id);

        this.storage.set(id, {
            ...user,
            ...properties
        });
    }

    updateProfile(formData: IUser): Promise<IUserWithRelations> {
        throw new Error('Method not implemented.');
    }

    updatePassword(formData: UserPasswordUpdate): Promise<IUserWithRelations> {
        throw new Error('Method not implemented.');
    }

    updateChainAddress(formData: IUser): Promise<IUserWithRelations> {
        throw new Error('Method not implemented.');
    }

    confirmEmail(token: IEmailConfirmationToken['token']): Promise<EmailConfirmationResponse> {
        throw new Error('Method not implemented.');
    }

    requestConfirmationEmail(): Promise<ISuccessResponse> {
        throw new Error('Method not implemented.');
    }
}
