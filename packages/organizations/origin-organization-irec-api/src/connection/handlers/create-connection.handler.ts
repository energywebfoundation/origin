import { Repository } from 'typeorm';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject } from '@nestjs/common';
import { Organization, OrganizationService } from '@energyweb/origin-backend';

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

        const isIssuer = irecOrganization.roles.includes(OrganisationRole.Issuer);
        const isRegistrant = irecOrganization.roles.includes(OrganisationRole.Registrant);
        const isParticipant = irecOrganization.roles.includes(OrganisationRole.Participant);

        if (isIssuer) {
            await this.createAccounts(clientId, clientSecret, tokens, organization, [
                AccountType.Issue,
                AccountType.Trade
            ]);
        } else if (isRegistrant || isParticipant) {
            await this.createAccounts(clientId, clientSecret, tokens, organization, [
                AccountType.Trade
            ]);
        } else {
            throw new BadRequestException(
                'IREC account organization has to have issuer or registrant or participant role'
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
            if (!irecAccounts.some((a) => a.code === account)) {
                await this.irecService.createAccountByTokens(clientId, clientSecret, tokens, {
                    code: `${account}-account`,
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
}
