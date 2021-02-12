import { Registration } from '../registration.entity';

export class RegistrationCreatedEvent {
    constructor(public readonly registration: Registration, public readonly userId: number) {}
}
