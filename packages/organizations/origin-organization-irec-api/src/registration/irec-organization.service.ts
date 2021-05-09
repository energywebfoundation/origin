import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { AccessTokens, IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import { GetConnectionCommand, RefreshTokensCommand } from '../connection';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecOrganizationService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    isIrecIntegrationEnabled(): boolean {
        return !!this.configService.get<string>('IREC_API_URL');
    }

    private async getIrecClient(user: UserIdentifier | string | number) {
        const irecConnection = await this.commandBus.execute(new GetConnectionCommand(user));

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        const client = new IRECAPIClient(this.configService.get<string>('IREC_API_URL'), {
            accessToken: irecConnection.accessToken,
            refreshToken: irecConnection.refreshToken,
            expiryDate: irecConnection.expiryDate
        });

        client.on('tokensRefreshed', (accessToken: AccessTokens) => {
            this.commandBus.execute(new RefreshTokensCommand(user, accessToken));
        });

        return client;
    }

    async createBeneficiary(
        user: UserIdentifier,
        organization: IPublicOrganization
    ): Promise<void> {
        if (!this.isIrecIntegrationEnabled()) {
            return;
        }
        const irecClient = await this.getIrecClient(user);
        await irecClient.beneficiary.create({
            name: organization.name,
            countryCode: organization.country,
            location: `${organization.city} ${organization.address}`,
            active: true
        });
    }
}
