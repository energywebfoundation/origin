import { Configuration } from '@energyweb/utils-general';

export enum BlockchainDataSourceType {
    Blockchain = 'BLOCKCHAIN'
}

export enum SimulationDataSourceType {
    Simulation = 'SIMULATION'
}

export enum MatcherType {
    ConfigurableReference = 'CONFIGURABLE_REFERENCE',
    Strategy = 'STRATEGY'
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

export interface ISimulationMatcherSpecification {
    type: MatcherType;
    matcherConfigFile?: string;
}

export interface IBlockchainMatcherSpecification {
    type: MatcherType;
    matcherConfigFile?: string;
}

export interface IMatcherConf {
    dataSource: ISimulationDataSource | IBlockchainDataSource;
    matcherSpecification: ISimulationMatcherSpecification | IBlockchainMatcherSpecification;
}
