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

    Object.keys(certificateData.onChainProperties)
        .forEach((key: string) => certificate[key] = certificateData.onChainProperties[key]);
    return certificate;

};

const test: CertificateData = {
    id: '0',

    onChainProperties: {
        retired: false,
        dataLog: '',
        creationTime: 0,
        parentId: 0,
        children: [],
        maxOwnerChanges: 5,
        ownerChangerCounter: 0,
        assetId: 0,
        owner: {
            address: '',
        },
        powerInW: 0,
   
        onCHainDirectPurchasePrice: 0,
        escrow: [
            {
                address: '',
            },
        ],
        approvedAddress: {
            address: '',
        },

    },
};