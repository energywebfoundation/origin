
// import Web3Type from '../types/web3'
// import { CoOTruffleBuild, AssetProducingLogicTruffleBuild, DemandLogicTruffleBuild, CertificateLogicTruffleBuild, AssetConsumingLogicTruffleBuild, UserLogicTruffleBuild, BlockchainProperties } from 'ewf-coo'

// // tslint:disable-next-line:no-var-requires
// const Web3 = require('web3')

// export class Web3Service {
//     web3: Web3Type
//     cooContractInstance: any
//     cooContractAddress: string
//     blockchainProperties: BlockchainProperties

//     constructor(cooContractAddress: string) {
//         // tslint:disable-next-line:no-string-literal
//         this.web3 = new Web3(Web3.givenProvider || 'http://localhost:8545')
//         this.cooContractAddress = cooContractAddress
//     }

//     async initContract() {

//         this.cooContractInstance = new this.web3.eth.Contract((CoOTruffleBuild as any).abi, this.cooContractAddress)
//         const assetProducingRegistryAddress = await this.cooContractInstance.methods.assetProducingRegistry().call()
//         const demandLogicAddress = await this.cooContractInstance.methods.demandRegistry().call()
//         const certificateLogicAddress = await this.cooContractInstance.methods.certificateRegistry().call()
//         const assetConsumingRegistryAddress = await this.cooContractInstance.methods.assetConsumingRegistry().call()
//         const userLogicAddress = await this.cooContractInstance.methods.userRegistry().call()

//         this.blockchainProperties = {
//             web3: this.web3,
//             producingAssetLogicInstance: new this.web3.eth.Contract((AssetProducingLogicTruffleBuild as any).abi, assetProducingRegistryAddress),
//             demandLogicInstance: new this.web3.eth.Contract((DemandLogicTruffleBuild as any).abi, demandLogicAddress),
//             certificateLogicInstance: new this.web3.eth.Contract((CertificateLogicTruffleBuild as any).abi, certificateLogicAddress),
//             consumingAssetLogicInstance: new this.web3.eth.Contract((AssetConsumingLogicTruffleBuild as any).abi, assetConsumingRegistryAddress),
//             userLogicInstance: new this.web3.eth.Contract((UserLogicTruffleBuild as any).abi, userLogicAddress)
//         }

//     }

// }