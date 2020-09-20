import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationCreatedEvent } from './events';

import { RegistrationDTO } from './registration.dto';
import { Registration } from './registration.entity';

@Injectable()
export class RegistrationService {
    constructor(
        @InjectRepository(Registration) private readonly repository: Repository<Registration>,
        private readonly eventBus: EventBus
    ) {}

    public async find(owner?: string): Promise<Registration[]> {
        return this.repository.find(owner ? { where: { owner } } : undefined);
    }

    public async register(user: ILoggedInUser, registration: RegistrationDTO): Promise<string> {
        const registrationToStore = new Registration({
            ...RegistrationDTO.sanitize(registration),
            owner: user.ownerId
        });

        const storedRegistration = await this.repository.save(registrationToStore);

        this.eventBus.publish(new RegistrationCreatedEvent(storedRegistration, user.id));

        return storedRegistration.id;
    }
}
