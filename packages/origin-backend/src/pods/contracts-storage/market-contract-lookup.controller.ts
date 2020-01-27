import { Controller, Get, Post, NotFoundException, Body, Delete } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { MarketContractLookup } from './market-contract-lookup.entity';
import { StorageErrors } from '../../enums/StorageErrors';

@Controller('marketcontractlookup')
export class MarketContractLookupController {
    constructor(
        @InjectRepository(MarketContractLookup)
        private readonly marketContractLookupRepository: Repository<MarketContractLookup>
    ) {}

    @Get()
    async get() {
        const contracts = await this.marketContractLookupRepository.find();

        return contracts.map(contract => contract.address);
    }

    @Post()
    async post(@Body() body: any) {
        let { value } = body;
        value = value.toLowerCase();

        const marketContracts = await this.marketContractLookupRepository.find();
        const marketAddresses = marketContracts.map(contract => contract.address);

        if (marketAddresses.includes(value)) {
            return {
                message: StorageErrors.ALREADY_EXISTS
            };
        }

        const newMarketContractLookup = new MarketContractLookup();
        newMarketContractLookup.address = value.toLowerCase();

        await this.marketContractLookupRepository.save(newMarketContractLookup);

        return {
            message: `MarketContractLookup ${value} created`
        };
    }

    @Delete()
    async delete(@Body() body: any) {
        let { value } = body;
        value = value.toLowerCase();

        console.log(`DELETE - MarketContractLookup ${value}`);

        const marketContractLookup = await this.marketContractLookupRepository.findOne(value);

        if (!marketContractLookup) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.marketContractLookupRepository.remove(marketContractLookup);

        return {
            message: `MarketContractLookup ${value} successfully deleted`
        };
    }
}
