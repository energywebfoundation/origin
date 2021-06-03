export class AddOrganizationBeneficiaryCommand {
    constructor(
        public readonly ownerOrganizationId: number,
        public readonly irecBeneficiaryId: number
    ) {}
}
