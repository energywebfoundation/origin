export class GetCertificateByTokenIdQuery {
    constructor(public readonly tokenId: number, public readonly userId: string) {}
}
