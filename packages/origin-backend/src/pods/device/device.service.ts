import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Device } from './device.entity';
import { ISmartMeterReadingsAdapter, ISmartMeterRead } from '@energyweb/origin-backend-core';
import { SM_READS_ADAPTER } from '../../const';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        @Inject(SM_READS_ADAPTER) private smartMeterReadingsAdapter?: ISmartMeterReadingsAdapter
    ) {}

    async findOne(id: string, options: FindOneOptions<Device> = {}) {
        const device = await this.repository.findOne(id, {
            loadRelationIds: true,
            ...options
        });

        if (this.smartMeterReadingsAdapter) {
            device.smartMeterReads = await this.smartMeterReadingsAdapter.get(device);
        }

        return device;
    }

    async addSmartMeterReading(id: string, newSmartMeterRead: ISmartMeterRead): Promise<void> {
        const device = await this.repository.findOne(id);

        if (this.smartMeterReadingsAdapter) {
            return this.smartMeterReadingsAdapter.save(device, newSmartMeterRead)
        }

        device.smartMeterReads = [...device.smartMeterReads, newSmartMeterRead];

        await device.save();
    }
}
