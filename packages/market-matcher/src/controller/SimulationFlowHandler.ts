// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it
import { logger } from '../Logger';
import * as SimulationFlowDef from '../schema-defs/simulation-flow/';
import { SimulationModeController } from './SimulationModeController';


export const handleFlowAction = async (
    simulationModeController: SimulationModeController,
    simulationFlowAction:
        | SimulationFlowDef.Sleep.ISleepAction
        | SimulationFlowDef.Agreement.IRegisterAgreementAction
        | SimulationFlowDef.Date.ISetDateAction
        | SimulationFlowDef.ProducingAsset.IRegisterProducingAssetAction
        | SimulationFlowDef.Certificate.IRegisterCertificateAction
        | SimulationFlowDef.Demand.IRegisterDemandAction
        | SimulationFlowDef.Supply.IRegisterSupplyAction
) => {
    switch (simulationFlowAction.type) {
        case SimulationFlowDef.Agreement.RegisterAgreementActionType.RegisterAgreement:
            await simulationModeController.registerAgreement(
                SimulationFlowDef.Agreement.agreementDataToEntity(simulationFlowAction.data)
            );
            break;
        case SimulationFlowDef.Demand.RegisterDemandActionType.RegisterDemand:
            await simulationModeController.registerDemand(
                SimulationFlowDef.Demand.demandDataToEntity(simulationFlowAction.data)
            );
            break;
        case SimulationFlowDef.Supply.RegisterSupplyActionType.RegisterSupply:
            await simulationModeController.registerSupply(
                SimulationFlowDef.Supply.supplyDataToEntity(simulationFlowAction.data)
            );
            break;
        case SimulationFlowDef.ProducingAsset.RegisterProducingAssetActionType
            .RegisterProducingAsset:
            await simulationModeController.registerProducingAsset(
                SimulationFlowDef.ProducingAsset.producingAssetDataToEntity(
                    simulationFlowAction.data
                )
            );
            break;
        case SimulationFlowDef.Certificate.RegisterCertificateActionType.RegisterCertificate:
            await simulationModeController.matchTrigger(
                SimulationFlowDef.Certificate.certificateDataToEntity(simulationFlowAction.data)
            );
            break;
        case SimulationFlowDef.Sleep.SleepActionType.Sleep:
            await sleep(simulationFlowAction.data.ms);
            break;
        case SimulationFlowDef.Date.SetDateActionType.SetDate:
            simulationModeController.setDataSourceTime(simulationFlowAction.data);
            break;
        default:
            throw new Error(
                'Unsupported simulation flow action type ' + (simulationFlowAction as any).type
            );
    }
};

const sleep = ms => {
    logger.verbose(`Sleeping for ${ms} ms`);

    return new Promise(resolve => setTimeout(resolve, ms));
};
