import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import {
    AccessTokens,
    Beneficiary,
    BeneficiaryUpdateParams,
    IRECAPIClient
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';

import { CreateConnectionDTO } from './dto';
import { GetConnectionCommand, RefreshTokensCommand } from '../connection';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

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

    isIrecIntegrationEnabled(): boolean {
        return !!this.configService.get<string>('IREC_API_URL');
    }

    async login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens> {
        const client = new IRECAPIClient(process.env.IREC_API_URL);

        return client.login(userName, password, clientId, clientSecret);
    }

    async createBeneficiary(
        user: UserIdentifier,
        organization: IPublicOrganization
    ): Promise<Beneficiary> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                id: 1,
                name: organization.name,
                countryCode: organization.country,
                location: `${organization.city}, ${organization.address}`,
                active: true
            };
        }
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.create({
            name: organization.name,
            countryCode: organization.country,
            location: `${organization.city}. ${organization.address}`,
            active: true
        });
    }

    async updateBeneficiary(
        user: UserIdentifier,
        beneficiaryId: number,
        params: BeneficiaryUpdateParams
    ): Promise<Beneficiary> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                id: 1,
                name: 'Test Corp',
                countryCode: 'GB',
                location: `Manchester, Lennon street`,
                active: params.active
            };
        }
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.update(beneficiaryId, params);
    }
}
