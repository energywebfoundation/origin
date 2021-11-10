export interface IGetAllCertificatesOptions {
    generationEndFrom?: Date;
    generationEndTo?: Date;
    generationStartFrom?: Date;
    generationStartTo?: Date;
    creationTimeFrom?: Date;
    creationTimeTo?: Date;
    deviceId?: string;
}
export class GetAllCertificatesQuery {
    constructor(public options: IGetAllCertificatesOptions = {}) {}
}
