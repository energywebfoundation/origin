import { ValidateDeviceOwnershipQuery } from '@energyweb/origin-backend-core';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceService } from '../device.service';

@QueryHandler(ValidateDeviceOwnershipQuery)
export class ValidateDeviceOwnershipQueryHandler
    implements IQueryHandler<ValidateDeviceOwnershipQuery> {
    private issuerTypeId: string;

    constructor(private readonly deviceService: DeviceService, configService: ConfigService) {
        this.issuerTypeId = configService.get<string>('ISSUER_ID');
    }

    public async execute({
        ownerId,
        externalRegistryId
    }: ValidateDeviceOwnershipQuery): Promise<boolean> {
        const device = await this.deviceService.findByExternalId({
            id: externalRegistryId,
            type: this.issuerTypeId
        });

        return device?.organizationId === parseInt(ownerId, 10);
    }
}
