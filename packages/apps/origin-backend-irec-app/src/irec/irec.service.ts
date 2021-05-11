import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';
import { AccessTokens, Beneficiary, IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand
} from '@energyweb/origin-organization-irec-api';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecService {
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
    ): Promise<Beneficiary> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                id: 1,
                name: 'Test Beneficiary',
                active: true,
                countryCode: 'GB',
                location: 'Hobbiton, The Shire'
            };
        }
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.create({
            name: organization.name,
            countryCode: organization.country,
            location: `${organization.city} ${organization.address}`,
            active: true
        });
    }
}
