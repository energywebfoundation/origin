import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(Country)
        private readonly countryRepository: Repository<Country>
    ) {}

    async getSingle(): Promise<Country> {
        const [country] = await this.countryRepository.find();

        return country;
    }

    async findAll(): Promise<Country[]> {
        return this.countryRepository.find();
    }

    async create(data: Partial<Country>): Promise<Country> {
        return this.countryRepository.create(data).save();
    }

    async remove(entity: Country) {
        return this.countryRepository.remove(entity);
    }
}
