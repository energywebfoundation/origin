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

// import * as React from 'react'
// import FadeIn from 'react-fade-in'
// import { Web3Service } from '../utils/Web3Service'
// import { Table } from '../elements/Table/Table'
// import { AssetType, Compliance, User, Demand, Currency, TimeFrame } from 'ewf-coo'

// export interface OnboardDemandProps {
//   web3Service: Web3Service,
//   currentUser: User
// }

// export class OnboardDemand extends React.Component<OnboardDemandProps, {}> {
//   constructor(props) {
//     super(props)
//     this.creatDemand = this.creatDemand.bind(this)
//   }

//   async creatDemand(input: any) {
//     const creationDemandProperties = {
//       buyer: '0x84a2c086ffa013d06285cdd303556ec9be5a1ff7',
//       enabledProperties: [false, false, false, false, false, false, false, false, false, false],
//       originator: '0x0000000000000000000000000000000000000000',
//       locationCountry: '',
//       locationRegion: '',
//       minCO2Offset: 0,
//       otherGreenAttributes: '',
//       typeOfPublicSupport: '',
//       productingAsset: 0,
//       consumingAsset: 0,
//       targetWhPerPeriod: 100,
//       pricePerCertifiedWh: 0,
//       assettype: AssetType.Wind,
//       registryCompliance: Compliance.none,
//       timeframe: TimeFrame.yearly,
//       currency: Currency.Euro,
//       startTime: 0,
//       endTime: 2524608000,
//       matcher: '0x343854A430653571B4De6bF2b8C475F828036C30'
//     }

//     const transformedInput = { ...input }

//     if (transformedInput.timeframe) {
//       transformedInput.timeframe = TimeFrame[transformedInput.timeframe]
//     }
//     if (transformedInput.assettype) {
//       transformedInput.assettype = AssetType[transformedInput.assettype]
//     }
//     if (transformedInput.registryCompliance) {
//       transformedInput.registryCompliance = Compliance[transformedInput.registryCompliance]
//     }

//     if (transformedInput.consumingAsset) {
//       transformedInput.consumingAsset = parseInt(transformedInput.consumingAsset, 10)
//     }
//     if (transformedInput.minCO2Offset) {
//       transformedInput.minCO2Offset = parseInt(transformedInput.minCO2Offset, 10)
//     }
//     if (transformedInput.productingAsset) {
//       transformedInput.productingAsset = parseInt(transformedInput.productingAsset, 10)
//     }
//     if (transformedInput.targetWhPerPeriod) {
//       transformedInput.targetWhPerPeriod = parseInt(transformedInput.targetWhPerPeriod, 10)
//     }

//     transformedInput.targetWhPerPeriod = transformedInput.targetWhPerPeriod * 1000

//     // console.log(transformedInput)
//     /// console.log({...creationDemandProperties, ...transformedInput})
//     const createdDemand: Demand = await Demand.CREATE_DEMAND({ ...creationDemandProperties, ...transformedInput }, this.props.web3Service.blockchainProperties, this.props.currentUser.accountAddress)
//     console.log(createdDemand)
//   }

//   render() {

//     const Tables = [
//       {
//         header: 'General'
//       },
//       {
//         data: [
//           {
//             label: 'Cap per Timeframe (kWh)',
//             key: 'targetWhPerPeriod',
//             toggle: { hide: true, description: '' },
//             input: { type: 'text' }
//           },

//           {
//             label: 'Timeframe',
//             key: 'timeframe',
//             toggle: { hide: true, description: '' },
//             input: {
//               type: 'select',
//               data: 'timeframes'
//             }
//           },
//           {
//             label: 'Start Date',
//             key: 'startTime',
//             toggle: { hide: true, description: '' },
//             input: { type: 'date' }
//           },
//           {
//             label: 'End Date',
//             key: 'endTime',
//             toggle: { hide: true, description: '' },
//             input: { type: 'date' }
//           },
//           {
//             label: 'Total Demand (kWh)',
//             key: 'totalDemand',
//             toggle: { hide: true, description: '' },
//             input: { type: 'text' }
//           },
//           {
//             label: 'Buyer’s Address',
//             key: 'buyer',
//             toggle: { hide: true, description: '' },
//             input: { type: 'text' }
//           }
//         ]
//       },
//       {
//         header: 'Criteria'
//       },
//       {
//         data: [
//           {
//             label: 'Originator',
//             key: 'originator',

//             toggle: {
//               label: 'All',
//               index: 0,
//               description: 'Only this originating address'
//             },
//             input: { type: 'text' }
//           }
//         ]
//       },
//       {
//         data: [
//           {
//             label: 'Min CO2 Offset',
//             key: 'minCO2Offset',

//             toggle: {
//               label: 'All',
//               index: 5,
//               description: 'Only if the CO2 saved is above'
//             },
//             input: { type: 'text' }
//           }
//         ]
//       },
//       {
//         header: 'Location'
//       },
//       {
//         data: [
//           {
//             label: 'Country',
//             key: 'locationCountry',
//             toggle: {
//               index: 3,
//               label: 'All',
//               description: 'Only this Country',
//               default: false
//             },
//             input: {
//               type: 'text'
//             }

//           },
//           {
//             label: 'Region',
//             key: 'locationRegion',
//             toggle: {
//               label: 'All',
//               index: 4,
//               description: 'Only this Region'
//             },
//             input: {
//               type: 'text'
//             }
//           }
//         ]
//       },
//       {
//         header: 'Type'
//       },
//       {
//         data: [
//           {
//             label: 'Asset Type',
//             key: 'assettype',
//             toggle: {
//               label: 'All',
//               index: 1,
//               description: 'Only this Asset Type'
//             },
//             input: {
//               type: 'select',
//               data: 'assetTypes'
//             }
//           },
//           {
//             label: 'Compliance',
//             key: 'registryCompliance',
//             toggle: {
//               index: 2,
//               label: 'All',
//               description: 'Only if compliant to'
//             },
//             input: {
//               type: 'select',
//               data: 'compliances'
//             }
//           }

//         ]
//       },
//       {
//         header: 'Consumption'
//       },
//       {
//         data: [
//           {
//             label: 'Coupled to Production Asset',
//             key: 'productingAsset',
//             toggle: {
//               label: 'No',
//               index: 6,
//               description: 'Yes, coupled to this producing Asset',
//               default: false,
//               key: 'consumptionKey1'
//             },
//             input: { type: 'text' }
//           },
//           {
//             label: 'Coupled to Consumption',
//             key: 'consumingAsset',
//             toggle: {
//               label: 'No',
//               index: 7,
//               description: 'Yes, coupled to this consumption address',
//               default: false,
//               key: 'consumptionKey1'
//             },
//             input: { type: 'text' }
//           }
//         ]
//       },
//       {
//         header: true,
//         footer: 'Create Demand',
//         footerClick: this.creatDemand
//       }
//     ]



//     const assetTypes = ['Wind', 'Solar', 'RunRiverHydro', 'BiomassGas']
//     const compliances = ['none', 'IREC', 'EEC', 'TIGR']
//     const timeframes = ['yearly', 'monthly', 'daily']

//     return  <div className='OnboardDemandWrapper'>
//               <Table type='admin' header={Tables} data={{  assetTypes, compliances, timeframes }} />
//             </div>

//   }
// }
