export class ResetPasswordRequestedEvent {
    constructor(public readonly email: string, public readonly token: string) {}
}
