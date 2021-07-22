import {
    EventFilter,
    utils,
    providers,
    BigNumber,
    ContractTransaction,
    Contract,
    constants
} from 'ethers';

import { Certificate, IClaimData, ICertificate, IData } from './Certificate';
import { getEventsFromContract, IBlockchainEvent } from '../utils/events';
import { IBlockchainProperties } from './BlockchainProperties';

export interface IShareInCertificate {
    [address: string]: string;
}

export const encodeClaimData = (claimData: IClaimData): string => {
    const { beneficiary, location, countryCode, periodStartDate, periodEndDate, purpose } =
        claimData;

    return utils.defaultAbiCoder.encode(
        ['string', 'string', 'string', 'string', 'string', 'string'],
        [beneficiary, location, countryCode, periodStartDate, periodEndDate, purpose]
    );
};

export const decodeClaimData = (encodedClaimData: string): IClaimData => {
    const [beneficiary, location, countryCode, periodStartDate, periodEndDate, purpose] =
        utils.defaultAbiCoder.decode(
            ['string', 'string', 'string', 'string', 'string', 'string'],
            encodedClaimData
        );

    return {
        beneficiary,
        location,
        countryCode,
        periodStartDate,
        periodEndDate,
        purpose
    };
};

export const encodeData = (data: IData): string => {
    const { generationStartTime, generationEndTime, deviceId, metadata } = data;

    return utils.defaultAbiCoder.encode(
        ['uint256', 'uint256', 'string', 'string'],
        [generationStartTime, generationEndTime, deviceId, metadata ?? '']
    );
};

export const decodeData = (encodedData: string): IData => {
    const [generationStartTime, generationEndTime, deviceId, metadata] =
        utils.defaultAbiCoder.decode(['uint256', 'uint256', 'string', 'string'], encodedData);

    return {
        generationStartTime: generationStartTime.toNumber(),
        generationEndTime: generationEndTime.toNumber(),
        deviceId,
        metadata
    };
};

export async function getAllCertificates(
    blockchainProperties: IBlockchainProperties
): Promise<Certificate[]> {
    const { registry } = blockchainProperties;

    const issuanceEvents = await getEventsFromContract(
        registry,
        registry.filters.IssuanceSingle(null, null, null)
    );

    const certificatePromises = issuanceEvents.map((event) =>
        new Certificate(event._id.toNumber(), blockchainProperties).sync()
    );

    return Promise.all(certificatePromises);
}

export async function getAllOwnedCertificates(
    blockchainProperties: IBlockchainProperties
): Promise<Certificate[]> {
    const { registry, activeUser } = blockchainProperties;
    const owner = await activeUser.getAddress();

    const transfers = await getEventsFromContract(
        registry,
        registry.filters.TransferSingle(null, null, owner, null, null)
    );
    const certificateIds = [
        ...new Set<number>(transfers.map((transfer) => transfer.id.toNumber()))
    ];
    const balances = await registry.balanceOfBatch(
        Array(certificateIds.length).fill(owner),
        certificateIds
    );
    const available = certificateIds.filter((id, index) => !balances[index].isZero());

    const certificatePromises = available.map((id) =>
        new Certificate(id, blockchainProperties).sync()
    );

    return Promise.all(certificatePromises);
}

export async function decodeEvent(
    eventName: string,
    event: providers.Log,
    contract: Contract
): Promise<IBlockchainEvent> {
    const eventBlock = await contract.provider.getBlock(event.blockHash);

    return {
        name: eventName,
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
        timestamp: eventBlock.timestamp,
        ...contract.interface.decodeEventLog(eventName, event.data, event.topics)
    };
}

export const getAllCertificateEvents = async (
    certId: number,
    blockchainProperties: IBlockchainProperties
): Promise<IBlockchainEvent[]> => {
    const { registry } = blockchainProperties;

    const getEvent = async (filter: EventFilter, eventName: string) => {
        const logs = await registry.provider.getLogs({
            ...filter,
            fromBlock: 0,
            toBlock: 'latest'
        });

        const parsedLogs = await Promise.all(
            logs.map(
                async (event: providers.Log): Promise<IBlockchainEvent> =>
                    decodeEvent(eventName, event, registry)
            )
        );

        return parsedLogs.filter(
            (event) => event._id?.toNumber() === certId || event.id?.toNumber() === certId
        );
    };

    const issuanceSingleEvents = await getEvent(
        registry.filters.IssuanceSingle(null, null, null),
        'IssuanceSingle'
    );

    const issuanceBatchEvents = await getEvent(
        registry.filters.IssuanceBatch(null, null, null),
        'IssuanceBatch'
    );

    const transferSingleEvents = await getEvent(
        registry.filters.TransferSingle(null, null, null, null, null),
        'TransferSingle'
    );

    const transferBatchEvents = await getEvent(
        registry.filters.TransferBatch(null, null, null, null, null),
        'TransferBatch'
    );

    const claimSingleEvents = await getEvent(
        registry.filters.ClaimSingle(null, null, null, null, null, null),
        'ClaimSingle'
    );

    const claimBatchEvents = await getEvent(
        registry.filters.ClaimBatch(null, null, null, null, null, null),
        'ClaimBatch'
    );

    return [
        ...issuanceSingleEvents,
        ...issuanceBatchEvents,
        ...transferSingleEvents,
        ...transferBatchEvents,
        ...claimSingleEvents,
        ...claimBatchEvents
    ];
};

export const calculateOwnership = async (
    certificateId: ICertificate['id'],
    blockchainProperties: IBlockchainProperties
): Promise<IShareInCertificate> => {
    const ownedShares: IShareInCertificate = {};
    const { registry } = blockchainProperties;

    const transferSingleEvents = (
        await getEventsFromContract(
            registry,
            registry.filters.TransferSingle(null, null, null, null, null)
        )
    ).filter((event) => event.id.eq(certificateId));

    const transferBatchEvents = (
        await getEventsFromContract(
            registry,
            registry.filters.TransferBatch(null, null, null, null, null)
        )
    ).filter((e) => e.ids.some((id: BigNumber) => id.eq(certificateId)));

    const allHistoricOwners = [
        ...new Set([...transferSingleEvents, ...transferBatchEvents].map((event) => event.to))
    ].filter((address) => address !== constants.AddressZero);

    const allHistoricOwnersBalances = await registry.balanceOfBatch(
        allHistoricOwners,
        Array(allHistoricOwners.length).fill(certificateId.toString())
    );

    allHistoricOwners.forEach((owner, index) => {
        ownedShares[owner] = allHistoricOwnersBalances[index].toString();
    });

    return ownedShares;
};

export const calculateClaims = async (
    certificateId: ICertificate['id'],
    blockchainProperties: IBlockchainProperties
): Promise<IShareInCertificate> => {
    const claimedShares: IShareInCertificate = {};
    const { registry } = blockchainProperties;

    const claimSingleEvents = (
        await getEventsFromContract(
            registry,
            registry.filters.ClaimSingle(null, null, null, null, null, null)
        )
    ).filter((event) => event._id.eq(certificateId));

    const claimBatchEvents = (
        await getEventsFromContract(
            registry,
            registry.filters.ClaimBatch(null, null, null, null, null, null)
        )
    ).filter((e) => e._ids.some((id: BigNumber) => id.eq(certificateId)));

    const allHistoricClaimers = [
        ...new Set([...claimSingleEvents, ...claimBatchEvents].map((event) => event._claimSubject))
    ].filter((address) => address !== constants.AddressZero);

    const allHistoricClaimersBalances = await registry.claimedBalanceOfBatch(
        allHistoricClaimers,
        Array(allHistoricClaimers.length).fill(certificateId.toString())
    );

    allHistoricClaimers.forEach((owner, index) => {
        claimedShares[owner] = allHistoricClaimersBalances[index].toString();
    });

    return claimedShares;
};

export async function approveOperator(
    operator: string,
    blockchainProperties: IBlockchainProperties
): Promise<ContractTransaction> {
    const { activeUser, registry } = blockchainProperties;

    const registryWithSigner = registry.connect(activeUser);

    return registryWithSigner.setApprovalForAll(operator, true);
}
