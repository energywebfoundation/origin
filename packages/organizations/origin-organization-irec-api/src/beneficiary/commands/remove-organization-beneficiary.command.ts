export class RemoveOrganizationBeneficiaryCommand {
    constructor(public readonly id: number, public readonly ownerOrganizationId: number) {}
}
