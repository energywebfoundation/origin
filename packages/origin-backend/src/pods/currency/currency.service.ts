import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currency.entity';

@Injectable()
export class CurrencyService {
    constructor(
        @InjectRepository(Currency)
        private readonly currencyRepository: Repository<Currency>
    ) {}

    async findOne(value: string): Promise<Currency> {
        return this.currencyRepository.findOne(value);
    }

    async findAll(): Promise<Currency[]> {
        return this.currencyRepository.find();
    }

    async create(data: Partial<Currency>): Promise<Currency> {
        return this.currencyRepository.create(data).save();
    }

    async remove(entity: Currency) {
        return this.currencyRepository.remove(entity);
    }
}
