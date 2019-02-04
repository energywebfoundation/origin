
export enum BlockchainDataSourceType {

    Blockchain = 'BLOCKCHAIN',
}

export enum SimulationDataSourceType {
    Simulation = 'SIMULATION',
}

export enum MatcherType {
    Simple = 'SIMPLE',
    ConfigurableReference = 'CONFIGURABLE_REFERENCE',
}

export interface BlockchainDataSource  {
    type: BlockchainDataSourceType;
    contractAddress: string;
}

export interface SimulationDataSource  {
    type: SimulationDataSourceType;
    simulationFlowFile: string;
}

export interface SimulationMatcherSpecification {
    type: MatcherType;
    matcherConfigFile?: string;
}

export interface BlockchainMatcherSpecification {
    type: MatcherType;
    matcherConfigFile?: string;
}

export interface MatcherConf {
    dataSource: SimulationDataSource | BlockchainDataSource;
    matcherSpecification: SimulationMatcherSpecification | BlockchainMatcherSpecification;
}
