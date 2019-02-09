import * as EwOrigin from 'ew-origin-lib';
import { IdentifiableEntity } from './index';

export interface RegisterCertificateAction {
    type: RegisterCertificateActionType;
    data: CertificateData;
}

export enum RegisterCertificateActionType {
    RegisterCertificate = 'REGISTER_CERTIFICATE', 
}

export interface CertificateData extends IdentifiableEntity {
    onChainProperties: EwOrigin.Certificate.CertificateSpecific;
}

export const certificateDataToEntity = (certificateData: CertificateData): EwOrigin.Certificate.Entity => {
    const certificate = new EwOrigin.Certificate.Entity(certificateData.id, null);
    Object.assign(certificate, certificateData.onChainProperties);
    return certificate;

};