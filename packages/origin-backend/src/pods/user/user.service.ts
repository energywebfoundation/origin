import {
    buildRights,
    IUser,
    KYCStatus,
    Role,
    UserStatus,
    UserPasswordUpdate,
    UserRegistrationData,
    IUserFilter,
    ILoggedInUser,
    BlockchainAccountType
} from '@energyweb/origin-backend-core';
import { recoverTypedSignatureAddress } from '@energyweb/utils-general';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    UnprocessableEntityException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { validate } from 'class-validator';
import { FindConditions, Repository, FindManyOptions } from 'typeorm';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { User } from './user.entity';
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service';
import { UpdateUserProfileDTO } from './dto/update-user-profile.dto';
import { BindBlockchainAccountDTO } from './dto/bind-blockchain-account.dto';
import { BlockchainAccount } from './blockchain-account.entity';

export type TUserBaseEntity = ExtendedBaseEntity & IUser;

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        @InjectRepository(BlockchainAccount)
        private readonly blockchainAccountRepository: Repository<BlockchainAccount>,
        private readonly config: ConfigService,
        private readonly emailConfirmationService: EmailConfirmationService
    ) {}

    public async getAll(options?: FindManyOptions<User>) {
        return this.repository.find({ ...options, relations: ['blockchainAccounts'] });
    }

    public async create(data: UserRegistrationData): Promise<User> {
        const isExistingUser = await this.hasUser({ email: data.email });

        if (isExistingUser) {
            const message = `User with email ${data.email} already exists`;

            this.logger.error(message);
            throw new ConflictException({
                success: false,
                message
            });
        }

        const user = await this.repository.save({
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            telephone: data.telephone,
            password: this.hashPassword(data.password),
            notifications: true,
            rights: Role.OrganizationAdmin,
            status: UserStatus.Pending,
            kycStatus: KYCStatus.Pending
        });

        await this.emailConfirmationService.create(user);

        return new User(user);
    }

    public async changeRole(userId: number, ...roles: Role[]) {
        this.logger.log(`Changing user role for userId=${userId} to ${buildRights(roles)}`);

        return this.repository.update(userId, { rights: buildRights(roles) });
    }

    async findById(id: number) {
        return this.findOne({ id });
    }

    async findByEmail(email: string) {
        const lowerCaseEmail = email.toLowerCase();

        return this.findOne({ email: lowerCaseEmail });
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

    async updateBlockchainAddress(
        id: number,
        signedMessage: BindBlockchainAccountDTO['signedMessage']
    ): Promise<ExtendedBaseEntity & IUser> {
        if (!signedMessage) {
            throw new BadRequestException('Signed message is empty.');
        }

        const user = await this.findById(id);

        const address = await recoverTypedSignatureAddress(
            this.config.get<string>('REGISTRATION_MESSAGE_TO_SIGN'),
            signedMessage
        );

        if (
            user.blockchainAccounts &&
            user.blockchainAccounts?.some((account) => account.address === address)
        ) {
            throw new Error('User has blockchain account already linked.');
        }

        const blockchainAccount = await this.blockchainAccountRepository.save({
            address,
            type: BlockchainAccountType.User,
            signedMessage
        });

        user.blockchainAccounts = [blockchainAccount];

        await this.repository.save(user);

        return user;
    }

    async setNotifications(id: number, notifications: boolean): Promise<TUserBaseEntity> {
        await this.repository.update(id, { notifications });

        return this.findById(id);
    }

    async addToOrganization(userId: number, organizationId: number) {
        await this.repository.update(userId, { organization: { id: organizationId } });
    }

    async removeFromOrganization(userId: number) {
        await this.repository.update(userId, { organization: null });
    }

    async findOne(conditions: FindConditions<User>): Promise<TUserBaseEntity> {
        const user = await ((this.repository.findOne(conditions, {
            relations: ['organization', 'blockchainAccounts']
        }) as Promise<IUser>) as Promise<TUserBaseEntity>);

        if (user) {
            const emailConfirmation = await this.emailConfirmationService.get(user.id);

            user.emailConfirmed = emailConfirmation?.confirmed || false;
        }

        return user;
    }

    private async hasUser(conditions: FindConditions<User>) {
        return (await this.findOne(conditions)) !== undefined;
    }

    async updateProfile(
        id: number,
        { firstName, lastName, email, telephone }: UpdateUserProfileDTO
    ): Promise<ExtendedBaseEntity & IUser> {
        const updateEntity = new User({
            firstName,
            lastName,
            email,
            telephone
        });

        const validationErrors = await validate(updateEntity, {
            skipUndefinedProperties: true
        });

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors
            });
        }

        await this.repository.update(id, updateEntity);

        return this.findOne({ id });
    }

    async updatePassword(
        email: string,
        user: UserPasswordUpdate
    ): Promise<ExtendedBaseEntity & IUser> {
        const _user = await this.getUserAndPasswordByEmail(email);

        if (_user && bcrypt.compareSync(user.oldPassword, _user.password)) {
            const updateEntity = new User({
                password: this.hashPassword(user.newPassword)
            });

            const validationErrors = await validate(updateEntity, {
                skipUndefinedProperties: true
            });

            if (validationErrors.length > 0) {
                throw new UnprocessableEntityException({
                    success: false,
                    errors: validationErrors
                });
            }

            await this.repository.update(_user.id, updateEntity);
            return this.findOne({ id: _user.id });
        }

        throw new ConflictException({
            success: false,
            errors: `Incorrect current password.`
        });
    }

    public async getUsersBy(filter: IUserFilter) {
        const { orgName, status, kycStatus } = filter;

        const isNullOrUndefined = (variable: any) => variable === null || variable === undefined;
        let result;
        if (orgName === undefined || '') {
            result = await this.repository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .where(
                    `${isNullOrUndefined(status) ? '' : 'user.status = :status'} 
            ${
                isNullOrUndefined(kycStatus)
                    ? ''
                    : `${isNullOrUndefined(status) ? '' : ' and '} user.kycStatus = :kycStatus`
            }`,
                    { status, kycStatus }
                )
                .getMany();
        } else {
            const _orgName = `%${orgName}%`;
            result = await this.repository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .where(
                    `organization.name ilike :_orgName ${
                        isNullOrUndefined(status) ? '' : 'and user.status = :status'
                    } ${isNullOrUndefined(kycStatus) ? '' : 'and user.kycStatus = :kycStatus'}`,
                    { _orgName, status, kycStatus }
                )
                .getMany();
        }
        return result;
    }

    async update(id: number, data: Partial<IUser>): Promise<ExtendedBaseEntity & IUser> {
        const entity = await this.findOne({ id });

        if (!entity) {
            throw new Error(`Can't find entity.`);
        }

        const validationErrors = await validate(data, {
            skipUndefinedProperties: true
        });

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors
            });
        }

        await this.repository.update(id, {
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            telephone: data.telephone,
            email: data.email,
            status: data.status,
            kycStatus: data.kycStatus
        });

        return this.findOne({ id });
    }

    public async canViewUserData(
        userId: IUser['id'],
        loggedInUser: ILoggedInUser
    ): Promise<boolean> {
        const user = await this.findById(userId);

        const isOwnUser = loggedInUser.id === userId;
        const isOrgAdmin =
            loggedInUser.organizationId === user.organization.id &&
            loggedInUser.hasRole(Role.OrganizationAdmin);
        const isAdmin = loggedInUser.hasRole(Role.Issuer, Role.Admin, Role.SupportAgent);

        return isOwnUser || isOrgAdmin || isAdmin;
    }
}
