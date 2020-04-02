/* eslint-disable max-classes-per-file */
export class UnauthorizedActionError extends Error {
    constructor() {
        super('Unauthorized action');
    }
}

export class UnknownEntityError extends Error {
    constructor(id: string) {
        super(`Unknown entity ${id}`);
    }
}

export class ForbiddenActionError extends Error {
    constructor(msg: string) {
        super(`Forbidden action: ${msg}`);
    }
}
