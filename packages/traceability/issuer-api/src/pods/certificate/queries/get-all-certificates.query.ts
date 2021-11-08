export interface IGetAllCertificatesOptions {
    generationEndFrom?: Date;
    generationEndTo?: Date;
}
export class GetAllCertificatesQuery {
    constructor(public options: IGetAllCertificatesOptions = {}) {}
}
