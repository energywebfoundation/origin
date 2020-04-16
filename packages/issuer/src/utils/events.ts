import { Contract, EventFilter } from 'ethers';

export const getEventsFromContract = async (contract: Contract, eventFilter: EventFilter) => {
    return (
        await contract.provider.getLogs({
            ...eventFilter,
            fromBlock: 0,
            toBlock: 'latest'
        })
    ).map((log) => contract.interface.parseLog(log).values);
};
