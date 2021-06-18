import { BigNumber, ContractTransaction, utils } from 'ethers';

import { IBlockchainProperties } from './BlockchainProperties';
import { Certificate, IClaimData, IData } from './Certificate';
import { encodeClaimData, encodeData } from './CertificateUtils';

export interface CertificateInfoInBatch extends IData {
    to: string;
    amount: BigNumber;
}

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
    certificateIds: number[],
    to: string,
    blockchainProperties: IBlockchainProperties,
    from?: string,
    values?: BigNumber[]
): Promise<ContractTransaction> {
    const certificatesPromises = certificateIds.map((certId) =>
        new Certificate(certId, blockchainProperties).sync()
    );

    const { registry, activeUser } = blockchainProperties;
    const registryWithSigner = registry.connect(activeUser);

    const activeUserAddress = await activeUser.getAddress();
    const fromAddress = from ?? activeUserAddress;

    const certificates = await Promise.all(certificatesPromises);

    const transferTx = await registryWithSigner.safeBatchTransferFrom(
        fromAddress,
        to,
        certificateIds,
        values ?? certificates.map((cert) => BigNumber.from(cert.owners[fromAddress] ?? 0)),
        utils.randomBytes(32) // TO-DO: replace with proper data
    );

    await transferTx.wait();

    return transferTx;
}

export async function claimCertificates(
    certificateIds: number[],
    claimData: IClaimData,
    blockchainProperties: IBlockchainProperties,
    forAddress?: string,
    values?: BigNumber[]
): Promise<ContractTransaction> {
    const certificatesPromises = certificateIds.map((certId) =>
        new Certificate(certId, blockchainProperties).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const { activeUser, registry } = blockchainProperties;
    const claimer = forAddress ?? (await activeUser.getAddress());

    const encodedClaimData = encodeClaimData(claimData);
    const data = utils.randomBytes(32);

    const registryWithSigner = registry.connect(activeUser);

    const claimTx = await registryWithSigner.safeBatchTransferAndClaimFrom(
        claimer,
        claimer,
        certificateIds,
        values ?? certificates.map((cert) => BigNumber.from(cert.owners[claimer] ?? 0)),
        data,
        certificates.map(() => encodedClaimData)
    );

    await claimTx.wait();

    return claimTx;
}
