/* eslint-disable max-classes-per-file */
export class UnauthorizedActionError extends Error {
    constructor() {
        super('Unauthorized action');
    }
}

export class UnknownEntity extends Error {
    constructor(id: string) {
        super(`Unknown entity ${id}`);
    }
}
