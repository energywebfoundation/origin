export class GetOrganizationsCommand {
    constructor(public readonly query: { ids?: number[] }) {}
}
