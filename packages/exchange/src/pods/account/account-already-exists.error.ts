export class AccountAlreadyExistsError extends Error {
    constructor(userId: string) {
        super(`User with userId=${userId} has already account deployed.`);
    }
}
