import { SimulationModeController } from './SimulationModeController';
import { logger } from '..';
import * as SimulationFlowDef from '../schema-defs/simulation-flow/';
    
export const handleFlowAction = async (
    simulationModeController: SimulationModeController,
    simulationFlowAction: (
        SimulationFlowDef.Sleep.SleepAction | 
        SimulationFlowDef.Agreement.RegisterAgreementAction | 
        SimulationFlowDef.Date.SetDateAction | 
        SimulationFlowDef.ProducingAsset.RegisterProducingAssetAction | 
        SimulationFlowDef.Certificate.RegisterCertificateAction |
        SimulationFlowDef.Demand.RegisterDemandAction |
        SimulationFlowDef.Supply.RegisterSupplyAction 

    ),
) => {
    switch (simulationFlowAction.type) {
        case SimulationFlowDef.Agreement.RegisterAgreementActionType.RegisterAgreement:
            await simulationModeController.registerAgreement(
                SimulationFlowDef.Agreement.agreementDataToEntity(
                    simulationFlowAction.data as SimulationFlowDef.Agreement.AgreementData,
                ),
            );
            break;
        case SimulationFlowDef.Demand.RegisterDemandActionType.RegisterDemand:
            await simulationModeController.registerDemand(
                SimulationFlowDef.Demand.demandDataToEntity(
                    simulationFlowAction.data as SimulationFlowDef.Demand.DemandData,
                ),
            );
            break;
        case SimulationFlowDef.Supply.RegisterSupplyActionType.RegisterSupply:
            await simulationModeController.registerSupply(
                SimulationFlowDef.Supply.supplyDataToEntity(
                    simulationFlowAction.data as SimulationFlowDef.Supply.SupplyData,
                ),
            );
            break;
        case SimulationFlowDef.ProducingAsset.RegisterProducingAssetActionType.RegisterProducingAsset:
            await simulationModeController.registerProducingAsset(
                SimulationFlowDef.ProducingAsset.producingAssetDataToEntity(
                    simulationFlowAction.data as SimulationFlowDef.ProducingAsset.ProducingAssetData,
                ),
            );
            break;
        case SimulationFlowDef.Certificate.RegisterCertificateActionType.RegisterCertificate:
            await simulationModeController.matchTrigger(
                SimulationFlowDef.Certificate.certificateDataToEntity(
                    simulationFlowAction.data as SimulationFlowDef.Certificate.CertificateData,
                ),
            );  
            break;
        case SimulationFlowDef.Sleep.SleepActionType.Sleep:
            await sleep(simulationFlowAction.data.ms);
            break;
        case SimulationFlowDef.Date.SetDateActionType.SetDate:
            simulationModeController.setDataSourceTime(
                simulationFlowAction.data as SimulationFlowDef.Date.DateData,
            );
            break;
        default:
            throw new Error('Unsupported simulation flow action type ' + (simulationFlowAction as any).type);
    }
};

const sleep = (ms) => {
    logger.verbose('Sleeping for ' + ms + 'ms');
    return new Promise((resolve) => setTimeout(resolve, ms));
};
