export class OrganizationDocumentOwnershipMismatchError extends Error {
    constructor() {
        super(`Provided documents are not owned by the registrant`);
    }
}
