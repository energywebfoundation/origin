import { Event as BlockchainEvent } from 'ethers';
import { randomBytes } from 'ethers/utils';
import { Configuration } from '@energyweb/utils-general';

import { Certificate } from './Certificate';
import { Registry } from '../ethers/Registry';
import { Issuer } from '../ethers/Issuer';
import { getEventsFromContract } from '../utils/events';

export async function claimCertificates(
    certificateIds: number[],
    configuration: Configuration.Entity
) {
    const certificatesPromises = certificateIds.map((certId) =>
        new Certificate(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const ownsAllCertificates = certificates.every((cert) => cert.isOwned === true);

    if (!ownsAllCertificates) {
        throw new Error(`You can only claim your own certificates`);
    }

    const values = certificates.map((cert) => cert.energy.publicVolume);

    // TO-DO: replace with proper claim data
    const claimData = certificates.map(() => randomBytes(32));
    const data = randomBytes(32);

    const {
        activeUser,
        registry
    } = configuration.blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

    const registryWithSigner = registry.connect(activeUser);

    const activeUserAddress = await activeUser.getAddress();

    const claimTx = await registryWithSigner.safeBatchTransferAndClaimFrom(
        activeUserAddress,
        activeUserAddress,
        certificateIds,
        values,
        data,
        claimData
    );

    await claimTx.wait();

    return claimTx;
}

export async function transferCertificates(
    certificateIds: number[],
    to: string,
    configuration: Configuration.Entity
) {
    const certificatesPromises = certificateIds.map((certId) =>
        new Certificate(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const ownsAllCertificates = certificates.every((cert) => cert.isOwned === true);

    if (!ownsAllCertificates) {
        throw new Error(`You can only claim your own certificates`);
    }

    const values = certificates.map((cert) => cert.energy.publicVolume);

    // TO-DO: replace with proper data
    const data = randomBytes(32);

    const { activeUser } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;
    const registryWithSigner = registry.connect(activeUser);

    const activeUserAddress = await activeUser.getAddress();

    const transferTx = await registryWithSigner.safeBatchTransferFrom(
        activeUserAddress,
        to,
        certificateIds,
        values,
        data
    );

    await transferTx.wait();

    return transferTx;
}

export async function getAllCertificates(
    configuration: Configuration.Entity
): Promise<Certificate[]> {
    const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const certificationRequestApprovedEvents = await getEventsFromContract(
        issuer,
        issuer.filters.CertificationRequestApproved(null, null, null)
    );
    const certificatePromises = certificationRequestApprovedEvents.map((event) =>
        new Certificate(event._certificateId.toNumber(), configuration).sync()
    );

    return Promise.all(certificatePromises);
}

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<BlockchainEvent[]> => {
    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const allEvents = await getEventsFromContract(
        registry,
        registry.filters.TransferSingle(null, null, null, null, null)
    );

    return allEvents.filter((event) => event._id === certId);
};
