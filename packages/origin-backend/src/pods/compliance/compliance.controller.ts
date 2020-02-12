import { Controller, Get, NotFoundException, Post, Delete, Body } from '@nestjs/common';
import { getRepository } from 'typeorm';

import { Compliance } from './compliance.entity';
import { StorageErrors } from '../../enums/StorageErrors';
import { ComplianceService } from './compliance.service';

@Controller('compliance')
export class ComplianceController {
    constructor(private readonly complianceService: ComplianceService) {}

    @Get()
    async get() {
        const compliance = await this.complianceService.getSingle();

        if (!compliance) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return compliance.standard;
    }

    @Post()
    async post(@Body() body: any) {
        const { value } = body;

        const compliances = await this.complianceService.findAll();

        if (compliances.length > 0) {
            const currentCompliance = compliances[0];

            if (value === currentCompliance.standard) {
                return {
                    message: StorageErrors.ALREADY_EXISTS
                };
            }

            // Override the current set standard
            await this.complianceService.remove(currentCompliance);
        }

        await this.complianceService.create({
            standard: value
        });

        return {
            message: `Compliance ${value} created`
        };
    }

    @Delete()
    async delete() {
        const complianceRepository = getRepository(Compliance);
        const [compliance] = await complianceRepository.find();

        if (!compliance) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await complianceRepository.remove(compliance);

        return {
            message: `Compliance ${compliance.standard} successfully deleted`
        };
    }
}
