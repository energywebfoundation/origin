import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IContractsLookup } from '@energyweb/origin-backend-core';
import { ContractsLookup } from './contracts-lookup.entity';

@Controller('contractslookup')
export class ContractsLookupController {
    constructor(
        @InjectRepository(ContractsLookup)
        private readonly contractsLookupRepository: Repository<ContractsLookup>
    ) {}

    @Get()
    async get(): Promise<IContractsLookup> {
        const contractsLookup = await this.contractsLookupRepository.find();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...existingContracts } = contractsLookup[0];

        return existingContracts;
    }

    @Post()
    async post(@Body() body: any) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newContracts } = body.value;
        const contracts = await this.contractsLookupRepository.find();

        if (contracts.length > 0) {
            // Override the currently set contracts
            await this.contractsLookupRepository.remove(contracts[0]);
        }

        const contractsLookup = new ContractsLookup();
        Object.assign(contractsLookup, {
            ...newContracts
        });

        await this.contractsLookupRepository.save(contractsLookup);

        return {
            message: `ContractsLookup ${JSON.stringify(body)} created`
        };
    }

    @Delete()
    async delete() {
        const contracts = await this.contractsLookupRepository.find();

        if (contracts.length > 0) {
            // Override the currently set contracts
            await this.contractsLookupRepository.remove(contracts[0]);
        }

        return {
            message: `ContractsLookup successfully deleted`
        };
    }
}
