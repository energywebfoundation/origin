// Copyright 2018 Energy Web Foundation
//
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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as React from 'react'

import { ConsumingAsset, User, AssetType, Certificate, Demand, DemandProperties } from 'ewf-coo'
import { Web3Service } from '../utils/Web3Service'
import { OrganizationFilter } from './OrganizationFilter'
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom'
import FadeIn from 'react-fade-in'
import { Table } from '../elements/Table/Table'
import TableUtils from '../elements/utils/TableUtils'

export interface ConsumingAssetTableProps {
    web3Service: Web3Service,
    consumingAssets: ConsumingAsset[],
    demands: Demand[],
    certificates: Certificate[],
    currentUser: User,
    baseUrl: string,
    switchedToOrganization: boolean
}

export interface ConsumingAssetTableState {
    enrichedConsumingAssetData: EnrichedConsumingAssetData[],
    detailViewForAssetId: number

}

export interface EnrichedConsumingAssetData {
    consumingAsset: ConsumingAsset,
    organizationName: string,
}

export class ConsumingAssetTable extends React.Component<ConsumingAssetTableProps, {}> {

    state: ConsumingAssetTableState

    constructor(props) {
        super(props)

        this.state = {
            enrichedConsumingAssetData: [],
            detailViewForAssetId: null
        }

        this.switchToOrganization = this.switchToOrganization.bind(this)
        this.operationClicked = this.operationClicked.bind(this)

    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization: switchedToOrganization
        })
    }

    async componentDidMount() {
        await this.getOrganizationNames(this.props)

    }

    async componentWillReceiveProps(newProps: ConsumingAssetTableProps) {
        await this.getOrganizationNames(newProps)
    }

    async getOrganizationNames(props: ConsumingAssetTableProps) {

        const enrichedConsumingAssetData = []

        const promieses = props.consumingAssets.map(async (consumingAsset: ConsumingAsset, index: number) =>
            ({
                consumingAsset: consumingAsset,
                organizationName: (await (new User(consumingAsset.owner, props.web3Service.blockchainProperties)).syncWithBlockchain()).organization
            })
        )

        Promise.all(promieses).then((enrichedConsumingAssetData) =>
            this.setState({
                enrichedConsumingAssetData: enrichedConsumingAssetData
            })
        )

    }

    operationClicked(key: string, id: number) {
        this.setState({
            detailViewForAssetId: id
        })
    
      }
    
      render() {
        if (this.state.detailViewForAssetId !== null) {
            return <Redirect push to={'/' + this.props.baseUrl + '/assets/consuming_detail_view/' + this.state.detailViewForAssetId} />;
        }

        const defaultWidth = 106
        const getKey = TableUtils.getKey
        const generateHeader = (label, width = defaultWidth, right = false, body = false) => (TableUtils.generateHeader(label, width, right, body))
        const generateFooter = TableUtils.generateFooter

        const TableHeader = [
            generateHeader('#', 145.98),
            generateHeader('Owner'),
            generateHeader('Town, Country'),
            generateHeader('Nameplate Capacity (kW)', defaultWidth, true),
            generateHeader('Consumption (kWh)', defaultWidth, true),

            generateHeader('Certified (kWh)', defaultWidth, true, true),
        ]

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 4,
            },
            generateFooter('Consumption (kWh)'),

            generateFooter('Certified (kWh)', true),
        ]



        //  this.getCO2Offset()
        const accumulatorCb = (accumulator, currentValue) => accumulator + currentValue

        const filteredEnrichedAssetData = this.state.enrichedConsumingAssetData.filter((enrichedConsumingAssetData: EnrichedConsumingAssetData) => {

            return !this.props.switchedToOrganization || enrichedConsumingAssetData.consumingAsset.owner === this.props.currentUser.accountAddress

        })
        let assets = null
        let total

        const operations = ['Show Details']

        const data = filteredEnrichedAssetData.map((enrichedConsumingAssetData: EnrichedConsumingAssetData) => {
            const consumingAsset = enrichedConsumingAssetData.consumingAsset

            // const generatedKWh = consumingAsset.certificatesUsedForWh / 1000
            const consumedKWh = consumingAsset.certificatesUsedForWh / 1000

            return [
                consumingAsset.id,
                enrichedConsumingAssetData.organizationName,
                consumingAsset.city + ', ' + consumingAsset.country,
                consumingAsset.maxCapacitySet ? 
                (consumingAsset.capacityWh / 1000).toFixed(3) : '-',
                (consumingAsset.lastSmartMeterReadWh / 1000).toFixed(3),
                (consumingAsset.certificatesUsedForWh / 1000).toFixed(3),
            ]
        })

        return <div className='ConsumptionWrapper'>
            <Table header={TableHeader} footer={TableFooter} actions={true} operationClicked={this.operationClicked} data={data} operations={operations} />
        </div>



    }
}