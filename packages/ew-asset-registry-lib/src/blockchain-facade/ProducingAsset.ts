import * as Configuration from '../Configuration'
import * as Asset from './Asset'
import * as ProducingAssetOffChainPropertiesSchema from '../../../schemas/ProducingAssetPropertiesOffChain.schema.json'

export enum Type {
    Wind,
    Solar,
    RunRiverHydro,
    BiomassGas
}

export enum Compliance {
    none,
    IREC,
    EEC,
    TIGR
}

export interface OnChainProperties extends Asset.OnChainProperties {

    certificatesCreatedForWh?: number
    lastSmartMeterCO2OffsetRead?: number
    maxOwnerChanges?: number
}

export interface OffChainProperties extends Asset.OffChainProperties {
    assetType: Type
    complianceRegistry: Compliance
    otherGreenAttributes: string
    typeOfPublicSupport: string

}

export const getAssetListLength = async (configuration: Configuration.Entity) => {

    return parseInt(await configuration.blockchainProperties.producingAssetLogicInstance.getAssetListLength(), 10)
}

export const getAllAssets = async (configuration: Configuration.Entity) => {

    const assetsPromises = Array(await getAssetListLength(configuration))
        .fill(null)
        .map((item, index) => (new Entity(index.toString(), configuration)).sync())

    return Promise.all(assetsPromises)

}

export const getAllAssetsOwnedBy = async (owner: string, configuration: Configuration.Entity) => {
    return (await getAllAssets(configuration))
        .filter((asset: Entity) => asset.owner.address.toLowerCase() === owner.toLowerCase())
}

export const createAsset = async (assetPropertiesOnChain: OnChainProperties, assetPropertiesOffChain: OffChainProperties, configuration: Configuration.Entity): Promise<Entity> => {
    const producingAsset = new Entity(null, configuration)
    const offChainStorageProperties = producingAsset.prepareEntityCreation(assetPropertiesOnChain, assetPropertiesOffChain, ProducingAssetOffChainPropertiesSchema)

    if (configuration.offChainDataSource) {
        assetPropertiesOnChain.url = producingAsset.getUrl()


        
        assetPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash
    }

    const tx = await configuration.blockchainProperties.producingAssetLogicInstance.createAsset(
        assetPropertiesOnChain.smartMeter.address,
        assetPropertiesOnChain.owner.address,
        assetPropertiesOnChain.maxOwnerChanges,
        assetPropertiesOnChain.matcher[0].address,
        assetPropertiesOnChain.active,
        assetPropertiesOnChain.propertiesDocumentHash,
        assetPropertiesOnChain.url,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        })

    producingAsset.id = configuration.blockchainProperties.web3.utils.hexToNumber(tx.logs[0].topics[1]).toString()

    await producingAsset.putToOffChainStorage(assetPropertiesOffChain, offChainStorageProperties)

    configuration.logger.info(`Producing asset ${producingAsset.id} created`)
    
    return producingAsset.sync()

}

export class Entity extends Asset.Entity implements OnChainProperties {

    certificatesCreatedForWh: number
    lastSmartMeterCO2OffsetRead: number
    maxOwnerChanges: number



    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/ProducingAsset`
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {

            const asset = await this.configuration.blockchainProperties.producingAssetLogicInstance.getAsset(this.id)

            this.certificatesUsedForWh = asset._certificatesUsedForWh
            this.smartMeter = asset._smartMeter
            this.owner = asset._owner
            this.lastSmartMeterReadWh = asset._lastSmartMeterReadWh
            this.active = asset._active
            this.lastSmartMeterReadFileHash = asset._lastSmartMeterReadFileHash
            this.matcher = asset._matcher
            this.certificatesCreatedForWh = asset._certificatesCreatedForWh
            this.lastSmartMeterCO2OffsetRead = asset._lastSmartMeterCO2OffsetRead
            this.maxOwnerChanges = asset._maxOwnerChanges
            this.propertiesDocumentHash = asset._propertiesDocumentHash
            this.url = asset._url

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash)
            this.configuration.logger.verbose(`Producing asset ${this.id} synced`)

        }
        return this
    }

}
