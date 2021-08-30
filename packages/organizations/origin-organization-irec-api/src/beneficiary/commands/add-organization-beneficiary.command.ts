export class AddOrganizationBeneficiaryCommand {
    constructor(public readonly ownerId: number, public readonly irecBeneficiaryId: number) {}
}
