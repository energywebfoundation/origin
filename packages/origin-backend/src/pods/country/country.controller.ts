import { Controller, Get, NotFoundException, Post, Delete, Body } from '@nestjs/common';

import { StorageErrors } from '../../enums/StorageErrors';
import { CountryService } from './country.service';

@Controller('country')
export class CountryController {
    constructor(private readonly countryService: CountryService) {}

    @Get()
    async get() {
        console.log(`GET - Country`);
        const country = await this.countryService.getSingle();

        if (!country) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        return {
            name: country.name,
            regions: JSON.parse(country.regions)
        };
    }

    @Post()
    async post(@Body() body: any) {
        const { value } = body;
        const newName = value.name;
        const newRegions = JSON.stringify(value.regions);

        console.log(`POST - Country: ${value}`);

        const countries = await this.countryService.findAll();

        if (countries.length > 0) {
            const currentCountry = countries[0];

            if (newName === currentCountry.name && newRegions === currentCountry.regions) {
                return {
                    message: StorageErrors.ALREADY_EXISTS
                };
            }

            // Override the current set standard
            await this.countryService.remove(currentCountry);
        }

        await this.countryService.create({
            name: newName,
            regions: newRegions
        });

        return {
            message: `Country ${newName} created`
        };
    }

    @Delete()
    async delete() {
        console.log(`DELETE - Country`);

        const country = await this.countryService.getSingle();

        if (!country) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.countryService.remove(country);

        return {
            message: `Compliance ${country.name} successfully deleted`
        };
    }
}
