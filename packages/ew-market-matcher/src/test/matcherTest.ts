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

// import Web3Type from '../types/web3'
// import { Demand, CoOTruffleBuild, DemandLogicTruffleBuild, AssetProducingLogicTruffleBuild, AssetConsumingLogicTruffleBuild, CertificateLogicTruffleBuild, ContractEventHandler, Asset, EventHandlerManager, BlockchainProperties, Certificate, ProducingAsset, ConsumingAsset } from 'ewf-coo'
// import { PrivateKeys } from '../test-accounts'
// import { expect } from 'chai';

// const Web3 from 'web3'

// let currenctCreatedDevice = 0
// let currentCreatedDemand = -1

// let testamount = 0

// const generatedProducingAssets = []
// const generatedConsumingAssets = []

// const namedProps = ["originator",
//     "assetType",
//     "compliance",
//     "country",
//     "region",
//     "minCO2",
//     "producing",
//     "consuming"]

// const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
//     const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
//     return new web3.eth.Contract(truffleBuild.abi, address)
// }

// const initDevices = async (topAdminAccount, blockchainProperties) => {

//     currenctCreatedDevice++
//     const possibleOwner = [topAdminAccount.address, "0x71c31ff1faa17b1cb5189fd845e0cca650d215d3", "0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243"]

//     const possibleCountry = ["Germany", "USA", "CANADA"]

//     const possibleRegion = ["Saxony", "Berlin", "Hessen", "Maine", "Texas", "California", "Quebec", "Ontario", "British Columbia"]

//     for (let i = 0; i < 3; i++) {
//         const assetOwner = possibleOwner[i]
//         const assetCountry = possibleCountry[i]

//         for (let j = 0; j < 3; j++) {
//             const assetRegion = possibleRegion[i * 3 + j]
//             const producingAssetProps = {
//                 smartMeter: "0x00f4af465162c05843ea38d203d37f7aad2e2c17",
//                 owner: assetOwner,
//                 operationalSince: 2423423422342,
//                 capacityWh: 1000000000,
//                 lastSmartMeterReadWh: 0,
//                 active: true,
//                 lastSmartMeterReadFileHash: "",
//                 country: assetCountry,
//                 region: assetRegion,
//                 zip: "09648",
//                 city: "Mittweida",
//                 street: "Markt",
//                 houseNumber: "16",
//                 gpsLatitude: "49.000000",
//                 gpsLongitude: "11.00000",
//                 assetType: j,
//                 certificatesCreatedForWh: 0,
//                 lastSmartMeterCO2OffsetRead: 0,
//                 cO2UsedForCertificate: 0,
//                 complianceRegistry: i,
//                 otherGreenAttributes: "N.A",
//                 typeOfPublicSupport: "N.A"
//             }

//             const generatedAsset = await ProducingAsset.CREATE_ASSET(producingAssetProps, blockchainProperties)
//             //       console.log("generating asset #" + generatedAsset.id)
//             generatedProducingAssets.push(generatedAsset)
//         }
//     }
//     //   console.log("generating consuming asset")
//     for (let i = 0; i < 3; i++) {
//         const consumingAssetProps = {
//             smartMeter: "0x00f4af465162c05843ea38d203d37f7aad2e2c17",
//             owner: topAdminAccount.address,
//             operationalSince: 2342343242,
//             capacityWh: 100000,
//             active: true,
//             country: "Germany",
//             region: "Saxony",
//             zip: "09648",
//             city: "Mittweida",
//             street: "Markt",
//             houseNumber: "16",
//             gpsLatitude: "49.000000",
//             gpsLongitude: "11.00000",
//             maxCapacitySet: false,
//             certificatesUsedForWh: 0
//         }

//         const consumingAsset = await ConsumingAsset.CREATE_ASSET(consumingAssetProps, blockchainProperties)
//         //   console.log("generating consuming asset #" + consumingAsset.id)
//         generatedConsumingAssets.push(consumingAsset)
//     }
// }

// const initDemands = async (topAdminAccount, blockchainProperties): Promise<Demand> => {
//     currentCreatedDemand++

//     const possibleOwner = [topAdminAccount.address, "0x71c31ff1faa17b1cb5189fd845e0cca650d215d3", "0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243"]

//     const possibleCountry = ["Germany", "USA", "CANADA"]

//     const possibleRegion = ["Saxony", "Berlin", "Hessen", "Maine", "Texas", "California", "Quebec", "Ontario", "British Columbia"]
//     let enabledProps = [false, false, false, false, false, false, false, false, false, false]

//     let mod1 = currentCreatedDemand & 1
//     let mod2 = currentCreatedDemand & 2
//     let mod3 = currentCreatedDemand & 4
//     let mod4 = currentCreatedDemand & 8
//     let mod5 = currentCreatedDemand & 16
//     let mod6 = currentCreatedDemand & 32
//     let mod7 = currentCreatedDemand & 64
//     let mod8 = currentCreatedDemand & 128

//     if (mod1 != 0) enabledProps[0] = true
//     if (mod2 != 0) enabledProps[1] = true
//     if (mod3 != 0) enabledProps[2] = true
//     if (mod4 != 0) enabledProps[3] = true
//     if (mod5 != 0) enabledProps[4] = true
//     if (mod6 != 0) enabledProps[5] = true
//     if (mod7 != 0) enabledProps[6] = true
//     if (mod8 != 0) enabledProps[7] = true

//     const demandProps = {
//         enabledProperties: enabledProps,
//         originator: possibleOwner[currentCreatedDemand % 3],
//         buyer: "0x59e67AE7934C37d3376ab9c8dE153D10E07AE8C9",
//         startTime: 2123123131,
//         endTime: 234234523454,
//         timeframe: currentCreatedDemand % 3,
//         pricePerCertifiedWh: 10,
//         currency: 0,
//         productingAsset: generatedProducingAssets[currentCreatedDemand % 9].id,
//         consumingAsset: generatedConsumingAssets[currentCreatedDemand % 3].id,
//         locationCountry: possibleCountry[currentCreatedDemand % 3],
//         locationRegion: possibleRegion[currentCreatedDemand % 3 * 3 + currentCreatedDemand % 3 + currentCreatedDemand % 1],
//         assettype: currentCreatedDemand % 3,
//         minCO2Offset: 1,
//         otherGreenAttributes: "N.A",
//         typeOfPublicSupport: "N.A",
//         targetWhPerPeriod: 100000,
//         registryCompliance: 0,
//         matcher: "0x343854a430653571b4de6bf2b8c475f828036c30"
//     }
//     if (!(enabledProps[0] && enabledProps[6])) {
//         /*   console.log("originator: " + enabledProps[0] + "\t assetType: " + enabledProps[1] + "\t compliance: " + enabledProps[2] + "\t country: " + enabledProps[3] + "\t region: " + enabledProps[4] + "\t minCO2: " + enabledProps[5] + "\t producing: " + enabledProps[6] + "\t consuming: " + enabledProps[7] + "\t")
//            console.log(demandProps)
//            console.log(generatedProducingAssets[currentCreatedDemand % 9].assetType)
//            console.log(generatedProducingAssets[currentCreatedDemand % 9].country)
//            console.log(generatedProducingAssets[currentCreatedDemand % 9].region)
//            console.log(generatedProducingAssets[currentCreatedDemand % 9].registryCompliance)

//    */
//         testamount++
//         let currentDemand = await Demand.CREATE_DEMAND(demandProps, blockchainProperties, topAdminAccount)
//         return currentDemand
//     }

// }

// describe('Test Matcher', async () => {

//     let topAdminAccount
//     let blockchainProperties: BlockchainProperties

//     it('should create new assets', async () => {

//         const cooAddress = process.argv[2]

//         const web3 = new Web3('http://localhost:8545')

//         topAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[0])

//         const wallet = await web3.eth.accounts.wallet.add(PrivateKeys[8])

//         const cooContractInstance = new web3.eth.Contract((CoOTruffleBuild as any).abi, "0x359c2c4a9cb9dffe672b0979fbeaa717a1ddf118")
//         const assetProducingRegistryAddress = await cooContractInstance.methods.assetProducingRegistry().call()
//         const demandLogicAddress = await cooContractInstance.methods.demandRegistry().call()
//         const certificateLogicAddress = await cooContractInstance.methods.certificateRegistry().call()
//         const assetConsumingRegistryAddress = await cooContractInstance.methods.assetConsumingRegistry().call()
//         const userLogicAddress = await cooContractInstance.methods.userRegistry().call()
//         blockchainProperties = {
//             web3: web3,
//             producingAssetLogicInstance: new web3.eth.Contract((AssetProducingLogicTruffleBuild as any).abi, assetProducingRegistryAddress),
//             demandLogicInstance: new web3.eth.Contract((DemandLogicTruffleBuild as any).abi, demandLogicAddress),
//             certificateLogicInstance: new web3.eth.Contract((CertificateLogicTruffleBuild as any).abi, certificateLogicAddress),
//             consumingAssetLogicInstance: new web3.eth.Contract((AssetConsumingLogicTruffleBuild as any).abi, assetConsumingRegistryAddress),
//             matcherAccount: wallet.address,
//             assetAdminAccount: topAdminAccount.address
//         }
//         await initDevices(topAdminAccount, blockchainProperties)
//         expect(generatedProducingAssets.length).to.equal(9);
//         expect(generatedConsumingAssets.length).to.equal(3);

//     }).timeout(7500);
//     /*   for (let i = 0; i < 256; i++) {
//            it('should create new demand #' + i, async () => {

//                let matchingPossible = true
//                let createdDemand: Demand = await initDemands(topAdminAccount.address, blockchainProperties)
//                if (!createdDemand) return true

//                const asset = generatedProducingAssets.find((a: ProducingAsset) => a.id === createdDemand.productingAsset)

//                for (let j = 0; j < 8; j++) {
//                    console.log(namedProps[j] + ' ' + createdDemand.getBitFromDemandMask(j))
//                }

//                if (createdDemand.getBitFromDemandMask(6)) {

//                    if (createdDemand.getBitFromDemandMask(0)) {
//                        if (createdDemand.originator !== asset.owner) {
//                            console.log("should not have matched because of originator")
//                            matchingPossible = false
//                        }
//                        else {
//                            console.log("owner fits")
//                        }
//                    }

//                    if (createdDemand.getBitFromDemandMask(1)) {
//                        if (createdDemand.assettype !== asset.assetType) {
//                            console.log("should not have matched because of assetType")
//                            matchingPossible = false

//                        }
//                        else {
//                            console.log("assetType fits")
//                        }
//                    }
//                    if (createdDemand.getBitFromDemandMask(2)) {
//                        if (createdDemand.registryCompliance !== asset.compliance) {
//                            console.log("should not have matched because of compliance")
//                            matchingPossible = false

//                        }
//                        else {
//                            console.log("compliance fits")
//                        }
//                    }
//                    if (createdDemand.getBitFromDemandMask(3)) {
//                        if (createdDemand.locationCountry !== asset.country) {
//                            console.log("should not have matched because of country")
//                            matchingPossible = false

//                        }
//                        else {
//                            console.log("country fits")
//                        }
//                    }
//                    if (createdDemand.getBitFromDemandMask(4)) {
//                        if (createdDemand.locationRegion !== asset.region) {
//                            console.log("should not have matched because of region")
//                            matchingPossible = false

//                        }
//                        else {
//                            console.log("region fits")
//                        }
//                    }
//                    if (createdDemand.getBitFromDemandMask(5)) {
//                        if (createdDemand.minCO2Offset !== asset.minCO2Offset) {
//                            console.log("should not have matched because of minCO2Offset")
//                            matchingPossible = false

//                        }
//                        else {
//                            console.log("minCO2Offset fits")
//                        }
//                    }
//                }
//                if (matchingPossible) console.log("should have matched")

//            }).timeout(5000);

// }   */
// });
