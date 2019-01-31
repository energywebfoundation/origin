import { Controller} from "../controller/Controller";
import { logger } from "./../index"
import { DemandData } from "../schemas/simulation-flow/RegisterDemand";
import { CertificateData } from "../schemas/simulation-flow/RegisterCertificate";

export namespace Filter {

    export const filterAgreements = async (controller: Controller, demands: DemandData[], certificate: CertificateData): Promise<DemandData[]> => {

        const filteredDemands = []

        for(let i = 0; i < demands.length; i++) {
            if (await checkFit(controller, demands[i], certificate)) {
                filteredDemands.push(demands[i])
            }
        }
        
        logger.verbose( filteredDemands.length + ' from ' + demands.length + ' are a possible fit for certificate #' + certificate.id)
        return filteredDemands
    }

    const getBitFromDemandMask = (demand: DemandData, bitPosition: number): boolean => {

        return ((2 ** bitPosition) & demand.demandMask) !== 0
    }

    const checkFit = async (controller: Controller, demand: DemandData, certificate: CertificateData): Promise<boolean> => {
        const loggerPrefix = '[Filter/checkFit] Demand #' + demand.id + ' '
        let fit = true
        const currentTime = await controller.getCurrentDataSourceTime()
        const asset = await controller.getProducingAsset(certificate.assetId)

        logger.debug(loggerPrefix + 'property mask ' + demand.demandMask
            + ' (originator: ' + getBitFromDemandMask(demand, 0) + ', '
            + 'asset type: ' + getBitFromDemandMask(demand, 1) + ', '
            + 'compliance: ' + getBitFromDemandMask(demand, 2) + ', '
            + 'country ' + getBitFromDemandMask(demand, 3) + ', '
            + 'region: ' + getBitFromDemandMask(demand, 4) + ', '
            + 'co2 offset: ' + getBitFromDemandMask(demand, 5) + ', '
            + 'producing asset: ' + getBitFromDemandMask(demand, 6) + ')'
        )
      
        if (demand.endTime < currentTime || demand.startTime > currentTime) {
            await controller.removeDemand(demand.id)
            fit = false
            logger.debug(loggerPrefix + 'is outdated. (current time: ' + currentTime + ', start time: ' + demand.startTime + ', end time: ' + demand.endTime)
        }

        if (getBitFromDemandMask(demand, 0) && demand.originator !== asset.owner) {
            fit = false
            logger.debug(loggerPrefix + 'demand originator (' + demand.originator + ') does not equal asset owner (' + asset.owner + ').' )
        }

        if (getBitFromDemandMask(demand, 1) && demand.assettype !== asset.assetType) {
            fit = false
            logger.debug(loggerPrefix + 'demand asset type (' + demand.assettype + ') does not equal asset type (' + asset.assetType + ').' )
        }

        if (getBitFromDemandMask(demand, 2) && demand.registryCompliance !== asset.complianceRegistry) {
            fit = false
            logger.debug(loggerPrefix + 'demand compliance (' + demand.productingAsset + ') does not equal asset compliance (' + asset.id + ').' )
        }

        if (getBitFromDemandMask(demand, 3) && demand.locationCountry !== asset.country) {
            fit = false
            logger.debug(loggerPrefix + 'demand country (' + demand.locationCountry + ') does not equal asset country (' + asset.country + ').' )
        }

        if (getBitFromDemandMask(demand, 4) && demand.locationRegion !== asset.region) {
            fit = false
            logger.debug(loggerPrefix + 'demand region (' + demand.locationRegion + ') does not equal asset region (' + asset.region + ').' )
        }

        if (getBitFromDemandMask(demand, 5) && demand.minCO2Offset > (certificate.coSaved / certificate.powerInW ) * 100){
            fit = false
            logger.debug(loggerPrefix + 'demand min co2 offset (' + demand.locationRegion + ') is larger than asset co2 offset (' + ((certificate.coSaved / certificate.powerInW ) * 100) + ').' )
        }

        if (getBitFromDemandMask(demand, 6) && demand.productingAsset !== asset.id) {
            fit = false
            logger.debug(loggerPrefix + 'demand producing asset (' + demand.productingAsset + ') does not equal asset id (' + asset.id + ').' )
        }

        logger.debug(loggerPrefix + (fit ? 'does' : 'does not') + ' fit with asset ' + asset.id + '.')

        return fit

    }

}