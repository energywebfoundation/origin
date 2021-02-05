import { CreateCertificationRequestDTO } from './create-certification-request.dto';

export class ValidateCertificationRequestCommand {
    constructor(public readonly dto: CreateCertificationRequestDTO) {}
}
