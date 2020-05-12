import {
    buildRights,
    IUser,
    IUserWithRelationsIds,
    KYCStatus,
    Role,
    Status,
    UserRegistrationData
} from '@energyweb/origin-backend-core';
import { recoverTypedSignatureAddress } from '@energyweb/utils-general';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { FindConditions, Repository } from 'typeorm';

import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { User } from './user.entity';

export type TUserBaseEntity = ExtendedBaseEntity & IUserWithRelationsIds;

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        private readonly config: ConfigService
    ) {}

    public async create(data: UserRegistrationData): Promise<User> {
        const isExistingUser = await this.hasUser({ email: data.email });

        if (isExistingUser) {
            this.logger.error(`User with email ${data.email} already exists`);
            throw new ConflictException();
        }

        return new User(
            await this.repository.save({
                title: data.title,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                telephone: data.telephone,
                password: this.hashPassword(data.password),
                notifications: true,
                rights: Role.OrganizationAdmin,
                status: Status.Pending,
                kycStatus: KYCStatus['Pending KYC']
            })
        );
    }

    public async changeRole(userId: number, ...roles: Role[]) {
        this.logger.log(`Changing user role for userId=${userId} to ${buildRights(roles)}`);

        return this.repository.update(userId, { rights: buildRights(roles) });
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
        return (this.repository
            .createQueryBuilder('user')
            .where('LOWER(user.blockchainAccountAddress) = LOWER(:blockchainAccountAddress)', {
                blockchainAccountAddress
            })
            .loadAllRelationIds()
            .getOne() as Promise<IUser>) as Promise<TUserBaseEntity>;
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

    async update(id: number | string, notifications: boolean): Promise<TUserBaseEntity> {
        await this.repository.update(id, { notifications });

        return this.findById(id);
    }

    async addToOrganization(userId: number, organizationId: number) {
        await this.repository.update(userId, { organization: { id: organizationId } });
    }

    async findOne(conditions: FindConditions<User>): Promise<TUserBaseEntity> {
        return (this.repository.findOne(conditions, {
            loadRelationIds: true
        }) as Promise<IUser>) as Promise<TUserBaseEntity>;
    }

    private async hasUser(conditions: FindConditions<User>) {
        return (await this.repository.findOne(conditions)) !== undefined;
    }
}
