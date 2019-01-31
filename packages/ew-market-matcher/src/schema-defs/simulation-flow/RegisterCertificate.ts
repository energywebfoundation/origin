import * as EwfCoo from 'ewf-coo'
import { IdentifiableEntity } from './index';


export interface RegisterCertificateAction {
    type: RegisterCertificateActionType,
    data: CertificateData
}

export enum RegisterCertificateActionType {
    RegisterCertificate = "REGISTER_CERTIFICATE"
    
}

export interface CertificateData extends EwfCoo.CertificateProperties, IdentifiableEntity {
    creationTime: number
    escrow: string
}
