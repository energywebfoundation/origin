import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compliance } from './compliance.entity';

@Injectable()
export class ComplianceService {
    constructor(
        @InjectRepository(Compliance)
        private readonly complianceRepository: Repository<Compliance>
    ) {}

    async getSingle(): Promise<Compliance> {
        const [compliance] = await this.complianceRepository.find();

        return compliance;
    }

    async findAll(): Promise<Compliance[]> {
        return this.complianceRepository.find();
    }

    async create(data: Partial<Compliance>): Promise<Compliance> {
        return this.complianceRepository.create(data).save();
    }

    async remove(entity: Compliance) {
        return this.complianceRepository.remove(entity);
    }
}
