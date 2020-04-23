import { randomBytes } from 'ethers/utils';
import { Configuration } from '@energyweb/utils-general';

import { Log } from 'ethers/providers';
import { EventFilter } from 'ethers';
import { Certificate } from './Certificate';
import { Registry } from '../ethers/Registry';
import { Issuer } from '../ethers/Issuer';
import { getEventsFromContract } from '../utils/events';

export interface IBlockchainEvent {
    name: string;
    transactionHash: string;
    blockHash: string;
    values: any;
    timestamp: number;
}

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
): Promise<IBlockchainEvent[]> => {
    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const getEvent = async (filter: EventFilter, eventName: string) => {
        const logs = await registry.provider.getLogs({
            ...filter,
            fromBlock: 0,
            toBlock: 'latest'
        });
        const parsedLogs = await Promise.all(
            logs.map(async (event: Log) => {
                const { values } = registry.interface.parseLog(event);
                const eventBlock = await registry.provider.getBlock(event.blockHash);

                return {
                    name: eventName,
                    transactionHash: event.transactionHash,
                    blockHash: event.blockHash,
                    values,
                    timestamp: eventBlock.timestamp
                };
            })
        );
        return parsedLogs.filter((event) => event.values._id.toNumber() === certId);
    };

    const issuanceSingleEvents = await getEvent(
        registry.filters.IssuanceSingle(null, null, null),
        'IssuanceSingle'
    );

    const transferSingleEvents = await getEvent(
        registry.filters.TransferSingle(null, null, null, null, null),
        'TransferSingle'
    );

    const claimSingleEvents = await getEvent(
        registry.filters.ClaimSingle(null, null, null, null, null, null),
        'ClaimSingle'
    );

    return [...issuanceSingleEvents, ...transferSingleEvents, ...claimSingleEvents];
};
