import { ConnectionDTO } from '../dto';
import { RegistrationDTO } from '../../registration';

export class ConnectionCreatedEvent {
    constructor(
        public readonly connection: ConnectionDTO,
        public readonly organizationId: number,
        public readonly registration: RegistrationDTO
    ) {}
}
