import { BigNumber, ContractTransaction, utils } from 'ethers';

import { IBlockchainProperties } from './BlockchainProperties';
import { Certificate, IClaimData, IData } from './Certificate';
import { encodeClaimData, encodeData } from './CertificateUtils';

export interface CertificateInfoInBatch extends IData {
    to: string;
    amount: BigNumber;
}

export type BatchCertificateTransfer = {
    id: number;
    to: string;
    from?: string;
    amount?: BigNumber;
};

export type BatchCertificateClaim = Omit<BatchCertificateTransfer, 'to'> & {
    claimData: IClaimData;
    to?: string;
};

export async function issueCertificates(
    certificateInfo: CertificateInfoInBatch[],
    blockchainProperties: IBlockchainProperties
): Promise<Certificate['id'][]> {
    const { issuer, registry, activeUser } = blockchainProperties;
    const issuerWithSigner = issuer.connect(activeUser);

    const data = certificateInfo.map((info) =>
        encodeData({
            generationStartTime: info.generationStartTime,
            generationEndTime: info.generationEndTime,
            deviceId: info.deviceId,
            metadata: info.metadata
        })
    );

    const batchIssueTx = await issuerWithSigner.issueBatch(
        certificateInfo.map((info) => info.to),
        certificateInfo.map((info) => info.amount),
        data
    );

    const { events } = await batchIssueTx.wait();

    let issuanceEvent: utils.LogDescription;

    for (const event of events) {
        try {
            issuanceEvent = issuer.interface.parseLog(event);
        } catch (e) {
            issuanceEvent = registry.interface.parseLog(event);
        }

        if (issuanceEvent.name === 'IssuanceBatch') {
            break;
        }
    }

    return issuanceEvent.args[2].map((id: BigNumber) => id.toNumber());
}

export async function transferCertificates(
    certificateBatch: BatchCertificateTransfer[],
    blockchainProperties: IBlockchainProperties
): Promise<ContractTransaction> {
    const certificatesPromises = certificateBatch.map((cert) =>
        new Certificate(cert.id, blockchainProperties).sync()
    );

    const { registry, activeUser } = blockchainProperties;
    const registryWithSigner = registry.connect(activeUser);

    const activeUserAddress = await activeUser.getAddress();

    const certificates = await Promise.all(certificatesPromises);

    const transferTx = await registryWithSigner.safeBatchTransferFromMultiple(
        certificateBatch.map((cert) => cert.from ?? activeUserAddress),
        certificateBatch.map((cert) => cert.to),
        certificateBatch.map((cert) => cert.id),
        certificateBatch.map(
            (cert) =>
                cert.amount ??
                BigNumber.from(
                    certificates.find((certificate) => certificate.id === cert.id).owners[
                        cert.from ?? activeUserAddress
                    ] ?? 0
                )
        ),
        certificateBatch.map(() => utils.randomBytes(32)) // TO-DO: replace with proper data
    );

    return transferTx;
}

export async function claimCertificates(
    certificateBatch: BatchCertificateClaim[],
    blockchainProperties: IBlockchainProperties
): Promise<ContractTransaction> {
    const certificatesPromises = certificateBatch.map((cert) =>
        new Certificate(cert.id, blockchainProperties).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const { activeUser, registry } = blockchainProperties;
    const activeUserAddress = await activeUser.getAddress();

    const registryWithSigner = registry.connect(activeUser);

    const claimTx = await registryWithSigner.safeBatchTransferAndClaimFromMultiple(
        certificateBatch.map((cert) => cert.from ?? activeUserAddress),
        certificateBatch.map((cert) => cert.to ?? cert.from ?? activeUserAddress),
        certificateBatch.map((cert) => cert.id),
        certificateBatch.map(
            (cert) =>
                cert.amount ??
                BigNumber.from(
                    certificates.find((certificate) => certificate.id === cert.id).owners[
                        cert.from ?? activeUserAddress
                    ] ?? 0
                )
        ),
        certificateBatch.map(() => utils.randomBytes(32)), // TO-DO: replace with proper data
        certificateBatch.map((cert) => encodeClaimData(cert.claimData))
    );

    return claimTx;
}
