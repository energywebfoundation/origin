import { Repository } from 'typeorm';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject } from '@nestjs/common';
import { Organization, OrganizationService } from '@energyweb/origin-backend';
import { randomBytes } from 'crypto';

import { RegistrationService } from '../../registration';
import { IREC_SERVICE, IrecService } from '../../irec';
import { CreateConnectionCommand } from '../commands';
import { ShortConnectionDTO } from '../dto';
import { ConnectionCreatedEvent } from '../events';
import { Connection } from '../connection.entity';
import { AccessTokens, AccountType, OrganisationRole } from '@energyweb/issuer-irec-api-wrapper';

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionHandler implements ICommandHandler<CreateConnectionCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService,
        private readonly organizationService: OrganizationService,
        private readonly eventBus: EventBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({
        user: { ownerId, organizationId },
        credentials: { userName, password, clientId, clientSecret }
    }: CreateConnectionCommand): Promise<ShortConnectionDTO> {
        const loginResult = await this.irecService.login({
            userName,
            password,
            clientId,
            clientSecret
        });

        const [registration] = await this.registrationService.find(
            String(ownerId || organizationId)
        );

        if (!registration) {
            throw new BadRequestException('IREC Registration not found');
        }

        const existingConnection = await this.repository.findOne({
            where: { registration: registration.id }
        });

        if (existingConnection) {
            if (userName !== existingConnection.userName) {
                throw new BadRequestException('IREC connection user name mismatch');
            }

            existingConnection.clientId = clientId;
            existingConnection.clientSecret = clientSecret;
            existingConnection.expiryDate = loginResult.expiryDate;
            existingConnection.accessToken = loginResult.accessToken;
            existingConnection.refreshToken = loginResult.refreshToken;
            existingConnection.active = true;
            existingConnection.attempts = 0;

            await existingConnection.save();

            return ShortConnectionDTO.sanitize(existingConnection);
        }

        await this.validateIrecAccount(organizationId, clientId, clientSecret, loginResult);

        const connection = await this.repository.save({
            ...loginResult,
            userName,
            registration,
            clientId,
            clientSecret
        });

        this.eventBus.publish(new ConnectionCreatedEvent(connection, organizationId, registration));
        return ShortConnectionDTO.sanitize(connection);
    }

    async validateIrecAccount(
        organizationId: number,
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens
    ) {
        const organization = await this.organizationService.findOne(organizationId);
        const irecOrganization = await this.irecService.getUserOrganizationByTokens(
            clientId,
            clientSecret,
            tokens
        );

        const accountTypesToRegister = this.getAccountTypesForOrganizationRoles(
            irecOrganization.roles
        );

        if (!accountTypesToRegister.length) {
            const isRegistrant = irecOrganization.roles.includes(OrganisationRole.Registrant);
            if (!isRegistrant) {
                throw new BadRequestException(
                    'IREC account organization has to have issuer or registrant or participant role'
                );
            }
        } else {
            await this.createAccounts(
                clientId,
                clientSecret,
                tokens,
                organization,
                accountTypesToRegister
            );
        }
    }

    async createAccounts(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens,
        organization: Organization,
        accounts: AccountType[]
    ): Promise<void> {
        const irecAccounts = await this.irecService.getAccountInfoByTokens(
            clientId,
            clientSecret,
            tokens
        );

        for (const account of accounts) {
            if (!irecAccounts.some((a) => a.type === account)) {
                const numberOfChars = 4;
                const randomCode = randomBytes(numberOfChars / 2).toString('hex'); // 1 byte is 2 characters

                await this.irecService.createAccountByTokens(clientId, clientSecret, tokens, {
                    code: `${account}-${randomCode}`,
                    type: account,
                    name: `origin ${account} account`,
                    private: false,
                    restricted: false,
                    active: true,
                    countryCode: organization.country,
                    notes: 'account created by Origin'
                });
            }
        }
    }

    private getAccountTypesForOrganizationRoles(roles: OrganisationRole[]): AccountType[] {
        const isIssuer = roles.includes(OrganisationRole.Issuer);
        const isParticipant = roles.includes(OrganisationRole.Participant);

        const accountTypes: AccountType[] = [];

        if (isIssuer) {
            accountTypes.push(AccountType.Issue);
        }
        if (isParticipant) {
            accountTypes.push(AccountType.Redemption);
            accountTypes.push(AccountType.Trade);
        }

        return accountTypes;
    }
}
