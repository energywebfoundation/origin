import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationDTO } from './registration.dto';
import { Registration } from './registration.entity';

@Injectable()
export class RegistrationService {
    constructor(
        @InjectRepository(Registration) private readonly repository: Repository<Registration>
    ) {}

    public async find(owner?: string): Promise<Registration[]> {
        return this.repository.find(owner ? { where: { owner } } : undefined);
    }

    public async register(owner: string, registration: RegistrationDTO): Promise<string> {
        const registrationToStore = new Registration({
            ...RegistrationDTO.sanitize(registration),
            owner
        });

        const { id } = await this.repository.save(registrationToStore);

        return id;
    }
}
