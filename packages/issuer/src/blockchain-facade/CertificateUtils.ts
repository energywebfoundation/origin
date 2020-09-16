import { Configuration } from '@energyweb/utils-general';
import { EventFilter, utils, providers } from 'ethers';

import { Certificate, IClaimData } from './Certificate';
import { Registry } from '../ethers/Registry';
import { Issuer } from '../ethers/Issuer';
import { getEventsFromContract, IBlockchainEvent } from '../utils/events';

export const encodeClaimData = async (
    claimData: IClaimData,
    configuration: Configuration.Entity
) => {
    const { beneficiary, address, region, zipCode, countryCode } = claimData;
    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    return registry.encodeClaimData(
        beneficiary ?? '',
        address ?? '',
        region ?? '',
        zipCode ?? '',
        countryCode ?? ''
    );
};

export const decodeClaimData = async (
    encodedClaimData: string,
    configuration: Configuration.Entity
): Promise<IClaimData> => {
    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;
    const {
        _beneficiary,
        _address,
        _region,
        _zipCode,
        _countryCode
    } = await registry.decodeClaimData(encodedClaimData);

    return {
        beneficiary: _beneficiary,
        address: _address,
        region: _region,
        zipCode: _zipCode,
        countryCode: _countryCode
    };
};

export async function claimCertificates(
    certificateIds: number[],
    claimData: IClaimData,
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

    const encodedClaimData = await encodeClaimData(claimData, configuration);
    const data = utils.randomBytes(32);

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
        certificates.map(() => encodedClaimData)
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
    const data = utils.randomBytes(32);

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

export async function getAllOwnedCertificates(
    configuration: Configuration.Entity
): Promise<Certificate[]> {
    const {
        registry,
        activeUser
    } = configuration.blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
    const owner = await activeUser.getAddress();

    const transfers = await getEventsFromContract(
        registry,
        registry.filters.TransferSingle(null, null, owner, null, null)
    );
    const certificateIds = [
        ...new Set<number>(transfers.map((transfer) => transfer._id.toNumber()))
    ];
    const balances = await registry.balanceOfBatch(
        Array(certificateIds.length).fill(owner),
        certificateIds
    );
    const available = certificateIds.filter((id, index) => !balances[index].isZero());

    const certificatePromises = available.map((id) => new Certificate(id, configuration).sync());

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
            logs.map(
                async (event: providers.Log): Promise<IBlockchainEvent> => {
                    const eventBlock = await registry.provider.getBlock(event.blockHash);

                    return {
                        name: eventName,
                        transactionHash: event.transactionHash,
                        blockHash: event.blockHash,
                        timestamp: eventBlock.timestamp,
                        ...registry.interface.decodeEventLog(eventName, event.data, event.topics)
                    };
                }
            )
        );
        return parsedLogs.filter((event) => event._id.toNumber() === certId);
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
