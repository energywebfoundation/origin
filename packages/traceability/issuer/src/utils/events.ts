import { Contract, EventFilter } from 'ethers';

export interface IBlockchainEvent {
    transactionHash: string;
    blockHash: string;
    name?: string;
    timestamp?: number;
    [key: string]: any;
}

export const getEventsFromContract = async (
    contract: Contract,
    eventFilter: EventFilter
): Promise<IBlockchainEvent[]> => {
    const logs = await contract.provider.getLogs({
        ...eventFilter,
        fromBlock: 0,
        toBlock: 'latest'
    });

    const parsedLogs = logs.map((log) => {
        const { name } = contract.interface.parseLog(log);

        return {
            ...contract.interface.decodeEventLog(name, log.data, log.topics),
            blockHash: log.blockHash,
            transactionHash: log.transactionHash
        };
    });

    return parsedLogs;
};
