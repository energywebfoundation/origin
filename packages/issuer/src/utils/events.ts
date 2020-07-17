import { Contract, EventFilter } from 'ethers';

export interface IBlockchainEvent {
    transactionHash: string;
    blockHash: string;
    values: any;
    name?: string;
    timestamp?: number;
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

    return logs.map((log) => ({
        values: contract.interface.parseLog(log).values,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash
    }));
};
