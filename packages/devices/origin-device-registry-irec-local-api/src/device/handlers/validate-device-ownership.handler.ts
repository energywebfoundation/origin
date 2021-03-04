import { ValidateDeviceOwnershipQuery } from '@energyweb/origin-backend-core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceService } from '../device.service';

@QueryHandler(ValidateDeviceOwnershipQuery)
export class ValidateDeviceOwnershipCommandHandler
    implements IQueryHandler<ValidateDeviceOwnershipQuery> {
    constructor(private readonly deviceService: DeviceService) {}

    public async execute({
        ownerId,
        externalRegistryId
    }: ValidateDeviceOwnershipQuery): Promise<boolean> {
        const device = await this.deviceService.findAll({
            where: { ownerId, id: externalRegistryId }
        });

        return device?.length === 1;
    }
}
