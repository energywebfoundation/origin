import {
    UserLoginReturnData,
    UserRegisterData,
    IUser,
    IUserWithRelationsIds,
    IUserProperties
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

    async register(data: UserRegisterData): Promise<IUser> {
        this.userIdCounter++;

        const user: IUserWithRelationsIds = {
            id: this.userIdCounter,
            ...data,
            organization: null,
            blockchainAccountAddress: '',
            blockchainAccountSignedMessage: '',
            notifications: false
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

    async getUserByBlockchainAccount(
        blockchainAccountAddress: string
    ): Promise<IUserWithRelationsIds> {
        const storedUsers = this.storage.values();

        for (const user of storedUsers) {
            if (
                user.blockchainAccountAddress?.toLowerCase() ===
                blockchainAccountAddress?.toLowerCase()
            ) {
                return user;
            }
        }

        return null;
    }

    async attachSignedMessage(id: number, signedMessage: string): Promise<any> {
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
        id: number,
        properties: Partial<Pick<IUserProperties, 'notifications'>>
    ): Promise<any> {
        const user = this.storage.get(id);

        this.storage.set(id, {
            ...user,
            ...properties
        });
    }
}
