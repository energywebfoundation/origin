import { Controller, Get, NotFoundException, Post, Delete, Body } from '@nestjs/common';

import { StorageErrors } from '../../enums/StorageErrors';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}

    @Get()
    async get() {
        console.log(`GET - Currency`);
        const currencies = await this.currencyService.findAll();

        return currencies.map(currency => currency.code);
    }

    @Post()
    async post(@Body() body: any) {
        let { value } = body;
        value = value.toUpperCase();

        console.log(`POST - Currency: ${value}`);

        const currencies = await this.currencyService.findAll();
        const currencyCodes = currencies.map(currency => currency.code);

        if (currencyCodes.includes(value)) {
            return {
                message: StorageErrors.ALREADY_EXISTS
            };
        }

        await this.currencyService.create({
            code: value.toUpperCase()
        });

        return {
            message: `Currency ${value} created`
        };
    }

    @Delete()
    async delete(@Body() body: any) {
        let { value } = body;
        value = value.toUpperCase();

        console.log(`DELETE - Currency ${value}`);

        const currency = await this.currencyService.findOne(value);

        if (!currency) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.currencyService.remove(currency);

        return {
            message: `Currency ${value} successfully deleted`
        };
    }
}
