import { SimulationModeController } from "./SimulationModeController";
import { logger } from "..";
import { DemandData, RegisterDemandAction, RegisterDemandActionType } from "../schemas/simulation-flow/RegisterDemand";
import { DateData, SetDateAction, SetDateActionType } from "../schemas/simulation-flow/SetDate";
import { CertificateData, RegisterCertificateAction, RegisterCertificateActionType } from "../schemas/simulation-flow/RegisterCertificate";
import { ProducingAssetData, RegisterProducingAssetAction, RegisterProducingAssetActionType } from "../schemas/simulation-flow/RegisterProducingAsset";
import { SleepAction, SleepActionType } from "../schemas/simulation-flow/Sleep";

export namespace SimulationFlowHandler {
    

    export const handleFlowAction = async (simulationModeController: SimulationModeController, simulationFlowAction: (SleepAction | RegisterDemandAction | SetDateAction | RegisterProducingAssetAction | RegisterCertificateAction)) => {
        switch(simulationFlowAction.type) {
            case RegisterDemandActionType.RegisterDemand:
                await simulationModeController.registerDemand(simulationFlowAction.data as DemandData)
                break
            case RegisterProducingAssetActionType.RegisterProducingAsset:
                await simulationModeController.registerProducingAsset(simulationFlowAction.data as ProducingAssetData)
                break
            case RegisterCertificateActionType.RegisterCertificate:
                await simulationModeController.matchTrigger(simulationFlowAction.data as CertificateData)
                break
            case SleepActionType.Sleep:
                await sleep(simulationFlowAction.data.ms)
                break
            case SetDateActionType.SetDate:
                simulationModeController.setDataSourceTime(simulationFlowAction.data as DateData)
                break
            default:
                throw new Error("Unsupported simulation flow action type " + (simulationFlowAction as any).type)
        }
    }

    const sleep = (ms) => {
        logger.verbose('Sleeping for ' + ms + 'ms')
        return new Promise(resolve => setTimeout(resolve, ms));
    }
} 