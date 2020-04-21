import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOriginConfiguration } from '@energyweb/origin-backend-core';
import { Configuration } from './configuration.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Injectable()
export class ConfigurationService {
    constructor(
        @InjectRepository(Configuration)
        private readonly configurationRepository: Repository<Configuration>
    ) {}

    async get(): Promise<Configuration> {
        const existingConfigurations = await this.configurationRepository.find();

        if (existingConfigurations.length < 1) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return existingConfigurations[0];
    }

    async update(data: IOriginConfiguration): Promise<Configuration> {
        let existing: Configuration;

        try {
            existing = await this.get();
        } catch (error) {
            existing = new Configuration();
        }

        Object.assign(existing, data);
        return this.configurationRepository.save(existing);
    }
}
