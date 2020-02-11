import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Device } from './device.entity';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>
    ) {}

    async findOne(id: string, options: FindOneOptions<Device> = {}) {
        return this.repository.findOne(id, {
            loadRelationIds: true,
            ...options
        });
    }
}
