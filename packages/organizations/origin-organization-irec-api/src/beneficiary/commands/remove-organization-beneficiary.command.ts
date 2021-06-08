export class RemoveOrganizationBeneficiaryCommand {
    constructor(public readonly id: number, public readonly ownerId: number) {}
}
