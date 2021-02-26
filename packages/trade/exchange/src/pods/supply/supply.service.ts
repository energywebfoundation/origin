import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Supply } from './supply.entity';
import { DeviceAlreadyUsedError } from './errors/device-already-used.error';

@Injectable()
export class SupplyService {
    constructor(@InjectRepository(Supply) private readonly repository: Repository<Supply>) {}

    public async create(ownerId: string, createSupplyDto: CreateSupplyDto): Promise<Supply> {
        const isUsed = await this.isDeviceAlreadySet(ownerId, createSupplyDto.deviceId);

        if (isUsed) {
            throw new DeviceAlreadyUsedError(createSupplyDto.deviceId);
        }

        const supplyToStore = new Supply({
            ...CreateSupplyDto.sanitize(createSupplyDto),
            ownerId
        });

        return this.repository.save(supplyToStore);
    }

    public findAll(ownerId: string): Promise<Supply[]> {
        return this.repository.find({ ownerId });
    }

    public findOne(ownerId: string, id: string): Promise<Supply> {
        return this.repository.findOne({ id, ownerId });
    }

    public findByDeviceId(ownerId: string, deviceId: string): Promise<Supply> {
        return this.repository.findOne({ ownerId, deviceId });
    }

    public async update(
        ownerId: string,
        id: string,
        updateSupplyDto: UpdateSupplyDto
    ): Promise<Supply> {
        const result = await this.repository.update(
            { id, ownerId },
            UpdateSupplyDto.sanitize(updateSupplyDto)
        );

        if (result.affected > 0) {
            return this.findOne(ownerId, id);
        }

        return null;
    }

    public async remove(ownerId: string, id: string): Promise<boolean> {
        const result = await this.repository.delete({ id, ownerId });

        return result.affected > 0;
    }

    private async isDeviceAlreadySet(ownerId: string, deviceId: string) {
        const count = await this.repository
            .createQueryBuilder('supply')
            .where('supply.ownerId = :ownerId AND LOWER(supply.deviceId) = LOWER(:deviceId)', {
                ownerId,
                deviceId
            })
            .getCount();

        return count > 0;
    }
}
