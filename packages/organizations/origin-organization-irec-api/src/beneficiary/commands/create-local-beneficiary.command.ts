import { CreateBeneficiaryDto } from '../dto';

export class CreateLocalBeneficiaryCommand {
    constructor(
        public readonly organizationId: number,
        public readonly beneficiary: CreateBeneficiaryDto
    ) {}
}
