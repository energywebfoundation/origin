import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
    AccessTokens,
    Device as IrecDevice,
    DeviceCreateUpdateParams,
    IRECAPIClient
} from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand
} from '@energyweb/origin-organization-irec-api';

@Injectable()
export class IrecDeviceService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    async getIrecClient(user: ILoggedInUser) {
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

    async createIrecDevice(
        user: ILoggedInUser,
        deviceData: DeviceCreateUpdateParams
    ): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        const irecDevice = irecClient.device.create(deviceData);
        await irecClient.device.submit(irecDevice.code);
        return irecDevice;
    }
}
