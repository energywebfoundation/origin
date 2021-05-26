export class OrganizationNameAlreadyTakenError extends Error {
    constructor(name: string) {
        super(`Organization name "${name}" is already taken`);
    }
}
