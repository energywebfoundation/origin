import { Event as BlockchainEvent } from 'ethers';
import { randomBytes } from 'ethers/utils';
import { Configuration } from '@energyweb/utils-general';

import { Certificate } from './Certificate';
import { Registry } from '../ethers/Registry';
import { Issuer } from '../ethers/Issuer';

export async function claimCertificates(
    certificateIds: number[],
    configuration: Configuration.Entity
) {
    const certificatesPromises = certificateIds.map((certId) =>
        new Certificate(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const ownedPromises = certificates.map((cert) => cert.isOwned());
    const owned = await Promise.all(ownedPromises);

    const ownsAllCertificates = owned.every((isOwned) => isOwned === true);

    if (!ownsAllCertificates) {
        throw new Error(`You can only claim your own certificates`);
    }

    const ownedVolumesPromises = certificates.map((cert) => cert.ownedVolume());
    const ownedVolumes = await Promise.all(ownedVolumesPromises);
    const values = ownedVolumes.map((ownedVolume) => ownedVolume.publicVolume);

    // TO-DO: replace with proper claim data
    const claimData = certificates.map(() => randomBytes(32));
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

    const ownedVolumesPromises = certificates.map((cert) => cert.ownedVolume());
    const ownedVolumes = await Promise.all(ownedVolumesPromises);
    const values = ownedVolumes.map((ownedVolume) => ownedVolume.publicVolume);

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
            const certId = await issuer.getCertificateIdForCertificationRequest(index + 1);
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

    const allEventTypesFilter = registry.filters.TransferSingle(null, null, null, null, null);
    const allEvents = (
        await registry.provider.getLogs({
            ...allEventTypesFilter,
            fromBlock: 0,
            toBlock: 'latest'
        })
    ).map((log) => registry.interface.parseLog(log).values);

    return allEvents.filter((event) => event._id === certId);
};
