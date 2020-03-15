import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeviceTypes } from './device-types.entity';

@Injectable()
export class DeviceTypesService {
    constructor(
        @InjectRepository(DeviceTypes)
        private readonly repository: Repository<DeviceTypes>
    ) {}

    @Get()
    async get(): Promise<string[][]> {
        const entity = await this.repository.findOne();

        if (!entity) {
            return [];
        }

        return JSON.parse(entity?.content);
    }
}
