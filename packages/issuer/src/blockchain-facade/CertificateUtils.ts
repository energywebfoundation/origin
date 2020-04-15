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

    return registryWithSigner.safeBatchTransferAndClaimFrom(
        activeUserAddress,
        activeUserAddress,
        certificateIds,
        values,
        data,
        claimData
    );
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

    return registryWithSigner.safeBatchTransferFrom(
        activeUserAddress,
        to,
        certificateIds,
        values,
        data
    );
}

export async function getAllCertificates(
    configuration: Configuration.Entity
): Promise<Certificate[]> {
    const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;
    const totalRequests = (await issuer.totalRequests()).toNumber();

    const certificatePromises = Array(totalRequests)
        .fill(null)
        .map(async (item, index) => {
            const certificationRequestApprovedEvents = await getEventsFromContract(
                issuer,
                issuer.filters.CertificationRequestApproved(null, index + 1, null)
            );

            const certId = certificationRequestApprovedEvents[0]._certificateId;
            return certId.gt(0) ? new Certificate(certId.toNumber(), configuration).sync() : null;
        });

    const certificates = await Promise.all(certificatePromises);

    return certificates.filter((cert) => cert !== null);
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
