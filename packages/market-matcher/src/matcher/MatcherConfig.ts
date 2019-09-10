import { Configuration } from '@energyweb/utils-general';

export enum BlockchainDataSourceType {
    Blockchain = 'BLOCKCHAIN'
}

export enum SimulationDataSourceType {
    Simulation = 'SIMULATION'
}

export interface IBlockchainDataSource {
    type: BlockchainDataSourceType;
    web3Url: string;
    offChainDataSourceUrl: string;
    marketContractLookupAddress: string;
    originContractLookupAddress: string;
    matcherAccount: Configuration.EthAccount;
}

export interface ISimulationDataSource {
    type: SimulationDataSourceType;
    simulationFlowFile: string;
}


export interface IMatcherConfig {
    dataSource: ISimulationDataSource | IBlockchainDataSource;
}
