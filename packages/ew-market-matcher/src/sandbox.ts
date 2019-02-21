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

// import Web3Type from './types/web3'
// import {  Demand, TimeFrame, Currency, ProducingAsset, ProducingAssetProperties, Asset, AssetProperties, AssetType, Compliance, Certificate, BlockchainProperties, CertificateLogicTruffleBuild, AssetProducingLogicTruffleBuild, AssetConsumingLogicTruffleBuild, DemandLogicTruffleBuild } from 'ewf-coo'
// import { PrivateKeys } from './test-accounts'


// const Web3 import 'web3'

// const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
//     const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
//     return new web3.eth.Contract(truffleBuild.abi, address)
// }

// const main = async () => {
//     const web3 = new Web3('http://localhost:8545')
//     const assetAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[2])
//     const topAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[0])
//     const agreementAdminAccount = await web3.eth.accounts.wallet.add("0xa05ddf7fe8302d117b516c0e401468a30c39a3e467ad3720381cf89500f0854b")


//     const blockchainProperties: BlockchainProperties = {
//         web3: web3,
//         producingAssetLogicInstance: await getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3),
//         consumingAssetLogicInstance: await getInstanceFromTruffleBuild(AssetConsumingLogicTruffleBuild, web3),
//         certificateLogicInstance: await getInstanceFromTruffleBuild(CertificateLogicTruffleBuild, web3),
//         demandLogicInstance: await getInstanceFromTruffleBuild(DemandLogicTruffleBuild, web3),
//         assetAdminAccount: assetAdminAccount.address,
//         topAdminAccount: topAdminAccount.address,
//         agreementAdmin: agreementAdminAccount.address
//     }

//     const demandProps = {
//         enabledProperties: [false, false, false, false, false, false, false, false, false, false],
//         originator: "0x59e67AE7934C37d3376ab9c8dE153D10E07AE8C9",
//         buyer: "0x59e67AE7934C37d3376ab9c8dE153D10E07AE8C9",
//         startTime: 2123123131,
//         endTime: 234234523454,
//         timeframe: TimeFrame.daily,
//         pricePerCertifiedWh: 10,
//         currency: Currency.Ether,
//         productingAsset: 0,
//         consumingAsset: 0,
//         locationCountry: "DE",
//         locationRegion: "SAXONY",
//         assettype: AssetType.Solar,
//         minCO2Offset: 1,
//         otherGreenAttributes: "N.A",
//         typeOfPublicSupport: "N.A",
//         targetWhPerPeriod: 100000,
//         registryCompliance: Compliance.none,
//         matcher: "0x343854a430653571b4de6bf2b8c475f828036c30"
//     }

//     console.log("Create demand")
//    // const demand = await Demand.CREATE_DEMAND(demandProps, blockchainProperties)
//     //console.log(demand)
//     console.log("creation done")
//     const assetProps: ProducingAssetProperties = {
//         // GeneralInformation
//         smartMeter: '0x59e67AE7934C37d3376ab9c8dE153D10E07AE8C9',
//         owner: topAdminAccount.address,
//         assetType: AssetType.BiomassGas,
//         operationalSince: 0,
//         capacityWh: 500,

//         certificatesCreatedForWh: 0,
//         active: true,
//         complianceRegistry: Compliance.EEC,

//         otherGreenAttributes: 'none',
//         typeOfPublicSupport: 'none',


//         // Location
//         country: 'DE',
//         region: 'Saxony',
//         zip: '1234',
//         city: 'Springfield',
//         street: 'No name street',
//         houseNumber: '1',
//         gpsLatitude: '0',
//         gpsLongitude: '0'

//     }

//     const asset = await ProducingAsset.CREATE_ASSET(assetProps, blockchainProperties)

//     console.log(asset.id)

//     //console.log(await Certificate.GET_ALL_CERTIFICATES(blockchainProperties))

//     //console.log((await Certificate.GET_ALL_CERTIFICATES_OWNED_BY('0x84A2C086Ffa013D06285cdD303556EC9bE5a1Ff7', blockchainProperties)).length)

//     console.log(await Certificate.GET_ALL_CERTIFICATES_WITH_ESCROW('0x343854A430653571B4De6bF2b8C475F828036C30', blockchainProperties))


// }

// main()
