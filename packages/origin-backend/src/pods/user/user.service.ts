import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindConditions } from 'typeorm';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import {
    UserRegisterData,
    IUserWithRelationsIds,
    IUser,
    UserUpdateData
} from '@energyweb/origin-backend-core';
import { recoverTypedSignatureAddress } from '@energyweb/utils-general';

import { User } from './user.entity';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

export type TUserBaseEntity = ExtendedBaseEntity & IUserWithRelationsIds;

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        private readonly config: ConfigService
    ) {}

    create(data: UserRegisterData): Promise<User> {
        const user = this.repository.create({
            ...data,
            password: this.hashPassword(data.password),
            blockchainAccountAddress: '',
            blockchainAccountSignedMessage: ''
        });

        return this.repository.save(user);
    }

    async findById(id: number | string) {
        const parsedId = typeof id === 'string' ? Number(id) : id;

        return this.findOne({ id: parsedId });
    }

    async findByEmail(email: string) {
        return this.findOne({ email });
    }

    async getUserAndPasswordByEmail(
        email: string
    ): Promise<Pick<IUser, 'id' | 'email'> & { password: string }> {
        return this.repository.findOne(
            { email },
            {
                select: ['id', 'email', 'password']
            }
        );
    }

    async findByBlockchainAccount(blockchainAccountAddress: string) {
        return this.findOne({ blockchainAccountAddress });
    }

    async findByIds(
        ids: number[],
        conditions: FindConditions<User> = {}
    ): Promise<TUserBaseEntity[]> {
        return (this.repository.findByIds(ids, conditions) as Promise<IUser[]>) as Promise<
            TUserBaseEntity[]
        >;
    }

    hashPassword(password: string) {
        return bcrypt.hashSync(password, this.config.get<number>('PASSWORD_HASH_COST'));
    }

    async attachSignedMessage(id: number | string, signedMessage: string) {
        if (!signedMessage) {
            throw new Error('Signed message is empty.');
        }

        const user = await this.findById(id);

        if (!user) {
            throw new Error(`Can't find user.`);
        }

        if (user.blockchainAccountAddress) {
            throw new Error('User has blockchain account already linked.');
        }

        const address = await recoverTypedSignatureAddress(
            this.config.get<string>('REGISTRATION_MESSAGE_TO_SIGN'),
            signedMessage
        );

        const alreadyExistingUserWithAddress = await this.repository.findOne({
            blockchainAccountAddress: address
        });

        if (alreadyExistingUserWithAddress) {
            throw new Error(
                `This blockchain address has already been linked to a different account.`
            );
        }

        user.blockchainAccountSignedMessage = signedMessage;
        user.blockchainAccountAddress = address;

        await this.repository.save(user);

        return user;
    }

    async update(
        id: number | string,
        data: Omit<UserUpdateData, 'blockchainAccountSignedMessage'>
    ): Promise<TUserBaseEntity> {
        const user = await this.findById(id);

        if (!user) {
            throw new Error(`Can't find user.`);
        }

        if (typeof data.notifications === 'undefined') {
            throw new Error(
                `You can only update "autoPublish" and "notifications" properties of user and they're not present in the payload.`
            );
        }

        if (typeof data.notifications !== 'undefined') {
            if (typeof data.notifications !== 'boolean') {
                throw new Error(`User "notifications" property has to be a boolean.`);
            }

            user.notifications = data.notifications;
        }

        return this.repository.save(user);
    }

    async findOne(conditions: FindConditions<User>): Promise<TUserBaseEntity> {
        return (this.repository.findOne(conditions, {
            loadRelationIds: true
        }) as Promise<IUser>) as Promise<TUserBaseEntity>;
    }
}
