export class AlreadyPartOfOrganizationError extends Error {
    constructor(email: string) {
        super(`User ${email} is already part of the other organization`);
    }
}
