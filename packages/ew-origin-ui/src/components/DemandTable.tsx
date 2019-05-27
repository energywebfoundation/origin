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
// import { ProducingAsset, Demand, DemandProperties, TimeFrame, User, ConsumingAsset, AssetType, Compliance } from 'ewf-coo'
// import { Web3Service } from '../utils/Web3Service'
// import { OrganizationFilter } from './OrganizationFilter'
// import { Table } from '../elements/Table/Table'
// import TableUtils from '../elements/utils/TableUtils'
// import FadeIn from 'react-fade-in'
// import {
//     NavLink,
//     withRouter
// } from 'react-router-dom'

// export interface DemandTableProps {
//     web3Service: Web3Service,
//     demands: Demand[],
//     producingAssets: ProducingAsset[],
//     consumingAssets: ConsumingAsset[],
//     currentUser: User,
//     switchedToOrganization: boolean,
//     baseUrl: string

// }

// export interface DemandTableState {
//     enrichedDemandData: EnrichedDemandData[]
// }

// export interface EnrichedDemandData {
//     demand: Demand,
//     buyer: User,
//     originator: User

// }

export const PeriodToSeconds = [31536000, 2592000, 86400, 3600];

// export class DemandTable extends React.Component<DemandTableProps, {}> {

//     state: DemandTableState

//     constructor(props) {
//         super(props)

//         this.state = {
//             enrichedDemandData: []
//         }

//         this.switchToOrganization = this.switchToOrganization.bind(this)

//     }

//     switchToOrganization(switchedToOrganization: boolean) {
//         this.setState({
//             switchedToOrganization: switchedToOrganization
//         })
//     }

//     async componentDidMount() {
//         await this.enrichData(this.props)

//     }

//     async componentWillReceiveProps(newProps: DemandTableProps) {
//         await this.enrichData(newProps)
//     }

//     async enrichData(props: DemandTableProps) {

//         const promieses = props.demands.map(async (demand: Demand, index: number) =>
//             ({
//                 demand: demand,
//                 producingAsset: this.props.producingAssets.find((asset: ProducingAsset) => asset.id === demand.productingAsset),
//                 consumingAsset: this.props.consumingAssets.find((asset: ConsumingAsset) => asset.id === demand.consumingAsset),
//                 buyer: (await (new User(demand.buyer, props.web3Service.blockchainProperties)).syncWithBlockchain()),
//                 originator: demand.getBitFromDemandMask(DemandProperties.Originator) ? (await (new User(demand.originator, props.web3Service.blockchainProperties)).syncWithBlockchain()) : '-'
//             })
//         )

//         Promise.all(promieses).then((enrichedDemandData) =>
//             this.setState({
//                 enrichedDemandData: enrichedDemandData
//             })
//         )

//     }

//     render() {

//         let total = null
//         let totalDemand = 0

//         const filteredEnrichedDemandData = this.state.enrichedDemandData.filter((enrichedDemandData: EnrichedDemandData) => {

//             return !this.props.switchedToOrganization || enrichedDemandData.demand.buyer === this.props.currentUser.accountAddress || (enrichedDemandData.demand.getBitFromDemandMask(DemandProperties.Originator) && enrichedDemandData.demand.originator === this.props.currentUser.accountAddress)

//         })

//         const defaultWidth = 106
//         const getKey = TableUtils.getKey
//         const generateHeader = (label, width = defaultWidth, right = false, body = false) => (TableUtils.generateHeader(label, width, right, body))
//         const generateFooter = TableUtils.generateFooter

//         const TableFooter = [
//             {
//                 label: 'Total',
//                 key: 'total',
//                 colspan: 12,
//             },
//             generateFooter('Energy Demand (kWh)', true)
//         ]

//         const data = filteredEnrichedDemandData.map((enrichedDemandData: EnrichedDemandData) => {
//             const demand = enrichedDemandData.demand
//             const overallDemand = Math.ceil((demand.endTime - demand.startTime) / PeriodToSeconds[demand.timeframe]) * (demand.targetWhPerPeriod / 1000)
//             totalDemand += overallDemand

//             return [
//                 demand.id,
//                 enrichedDemandData.buyer.organization,
//                 demand.getBitFromDemandMask(DemandProperties.Originator) ? enrichedDemandData.originator.organization : '-',
//                 (new Date(demand.startTime * 1000)).toDateString() + ' - ' + (new Date(demand.endTime * 1000)).toDateString(),
//                 demand.getBitFromDemandMask(DemandProperties.Country) ? demand.locationCountry : '-' + ' ' +
//                     demand.getBitFromDemandMask(DemandProperties.Region) ? demand.locationRegion : '-',
//                 demand.getBitFromDemandMask(DemandProperties.AssetType) ? AssetType[demand.assettype] : '-',
//                 demand.getBitFromDemandMask(DemandProperties.Compliance) ? Compliance[demand.registryCompliance] : '-',
//                 TimeFrame[demand.timeframe],
//                 demand.getBitFromDemandMask(DemandProperties.Producing) ? demand.productingAsset : '-',
//                 demand.getBitFromDemandMask(DemandProperties.Consuming) ? demand.consumingAsset : '-',
//                 demand.getBitFromDemandMask(DemandProperties.MinCO2) ? demand.minCO2Offset.toFixed(3) : '-',
//                 (demand.targetWhPerPeriod / 1000).toFixed(3),
//                 overallDemand.toFixed(3)
//             ]
//         })

//         const TableHeader = [
//             generateHeader('#'),
//             generateHeader('Buyer'),
//             generateHeader('Originating Address'),
//             generateHeader('Start/End-Date'),
//             generateHeader('Country,<br/>Region'),
//             generateHeader('Asset Type'),
//             generateHeader('Compliance'),
//             generateHeader('Coupling Timeframe'),
//             generateHeader('Production Coupling with Asset'),
//             generateHeader('Consumption Coupling with Asset'),
//             generateHeader('Min CO2 Offset'),
//             generateHeader('Coupling Cap per Timeframe (kWh)'),
//             generateHeader('Energy Demand (kWh)', defaultWidth, true, true),

//         ]

//         return <div className='ForSaleWrapper'>
//             <Table classNames={['bare-font', 'bare-padding']} header={TableHeader} footer={TableFooter} actions={true} data={data} actionWidth={55.39} />
//         </div>

//     }

// }
