import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { CreateIrecCertificationRequestDTO } from '../create-irec-certification-request.dto';

export class CreateIrecCertificationRequestCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly dto: CreateIrecCertificationRequestDTO
    ) {}
}
