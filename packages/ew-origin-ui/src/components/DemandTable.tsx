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

import * as React from 'react';
import moment from 'moment';
import { Redirect } from 'react-router-dom';

import { Configuration, TimeFrame, Compliance, AssetType } from 'ew-utils-general-lib';
import { ProducingAsset, ConsumingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { showNotification, NotificationType } from '../utils/notifications';
import { deleteDemand } from 'ew-market-lib/dist/js/src/blockchain-facade/Demand';

export interface IDemandTableProps {
    conf: Configuration.Entity;
    demands: Demand.Entity[];
    producingAssets: ProducingAsset.Entity[];
    consumingAssets: ConsumingAsset.Entity[];
    currentUser: User;
    switchedToOrganization: boolean;
    baseUrl: string;
}

export interface IDemandTableState {
    enrichedDemandData: IEnrichedDemandData[];
    showMatchingSupply: number;
}

export interface IEnrichedDemandData {
    demand: Demand.Entity;
    demandOwner: User;
    consumingAsset?: ConsumingAsset.Entity;
    producingAsset?: ProducingAsset.Entity;
}

export const PeriodToSeconds = [31536000, 2592000, 86400, 3600];

const NO_VALUE_TEXT = 'any';

enum OPERATIONS {
    DELETE = 'Delete',
    SUPPLIES = 'Show supplies for demand'
}

export class DemandTable extends React.Component<IDemandTableProps, {}> {
    state: IDemandTableState;

    constructor(props) {
        super(props);

        this.state = {
            enrichedDemandData: [],
            showMatchingSupply: null
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.operationClicked = this.operationClicked.bind(this);
        this.showMatchingSupply = this.showMatchingSupply.bind(this);
    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization
        });
    }

    async componentDidMount() {
        await this.enrichData(this.props);
    }

    async componentWillReceiveProps(newProps: IDemandTableProps) {
        await this.enrichData(newProps);
    }

    async enrichData(props: IDemandTableProps) {
        const promises = props.demands.map(async (demand: Demand.Entity) => {
            const result: IEnrichedDemandData = {
                demand,
                producingAsset: null,
                consumingAsset: null,
                demandOwner: await (new User(demand.demandOwner, props.conf)).sync()
            };

            if (demand.offChainProperties) {
                if (typeof(demand.offChainProperties.productingAsset) !== 'undefined') {
                    result.producingAsset = this.props.producingAssets.find(
                        (asset: ProducingAsset.Entity) =>
                            asset.id === demand.offChainProperties.productingAsset.toString()
                    );
                }

                if (typeof(demand.offChainProperties.consumingAsset) !== 'undefined') {
                    result.consumingAsset = this.props.consumingAssets.find(
                        (asset: ConsumingAsset.Entity) =>
                            asset.id === demand.offChainProperties.consumingAsset.toString()
                    );
                }
            }

            return result;
        });

        Promise.all(promises).then(enrichedDemandData => this.setState({ enrichedDemandData }));
    }

    getCountryRegionText(demand: Demand.Entity): string {
        let text = '';

        if (demand.offChainProperties.locationCountry) {
            text += demand.offChainProperties.locationCountry;
        }

        if (demand.offChainProperties.locationRegion) {
            text += `, ${demand.offChainProperties.locationRegion}`;
        }

        return text || NO_VALUE_TEXT;
    }

    async operationClicked(key: string, id: number) {
        switch (key) {
            case OPERATIONS.DELETE:
                this.deleteDemand(id);
                break;
            case OPERATIONS.SUPPLIES:
                this.showMatchingSupply(id);
                break;
            default:
        }
    }

    async deleteDemand(id: number) {
        try {
            this.props.conf.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };
            await deleteDemand(id, this.props.conf);

            showNotification('Demand deleted', NotificationType.Success);
        } catch (error) {
            console.error(error);
            showNotification(`Can't delete demand`, NotificationType.Error);
        }
    }

    showMatchingSupply(demandId: number) {
        this.setState({
            showMatchingSupply: demandId
        });
    }

    render() {
        if (this.state.showMatchingSupply !== null) {
            return (
                <Redirect push={true} to={`/${this.props.baseUrl}/certificates/for_demand/${this.state.showMatchingSupply}`} />
            );
        }

        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 11
            },
            generateFooter('Energy Demand (kWh)', true)
        ];

        const data = this.state.enrichedDemandData.map(
            (enrichedDemandData: IEnrichedDemandData) => {
                const demand = enrichedDemandData.demand;
                const overallDemand = Math.ceil(
                    (parseInt(demand.offChainProperties.endTime, 10) - parseInt(demand.offChainProperties.startTime, 10)) / PeriodToSeconds[demand.offChainProperties.timeframe] / 1000)
                        * (demand.offChainProperties.targetWhPerPeriod / 1000)

                return [
                    demand.id,
                    enrichedDemandData.demandOwner.organization,
                    (moment(demand.offChainProperties.startTime, 'x')).format('DD MMM YY') + ' - ' +
                        (moment(demand.offChainProperties.endTime, 'x')).format('DD MMM YY'),
                    this.getCountryRegionText(demand),
                    typeof(demand.offChainProperties.assettype) !== 'undefined' ? AssetType[demand.offChainProperties.assettype] : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.registryCompliance) !== 'undefined' ? Compliance[demand.offChainProperties.registryCompliance] : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.timeframe) !== 'undefined' ? TimeFrame[demand.offChainProperties.timeframe] : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.productingAsset) !== 'undefined' ? demand.offChainProperties.productingAsset : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.consumingAsset) !== 'undefined' ? demand.offChainProperties.consumingAsset : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.minCO2Offset) !== 'undefined' ? demand.offChainProperties.minCO2Offset.toLocaleString() : 0,
                    (demand.offChainProperties.targetWhPerPeriod / 1000).toLocaleString(),
                    overallDemand
                ];
            }
        );

        const TableHeader = [
            generateHeader('#'),
            generateHeader('Buyer'),
            generateHeader('Start/End-Date'),
            generateHeader('Country,<br/>Region'),
            generateHeader('Asset Type'),
            generateHeader('Compliance'),
            generateHeader('Coupling Timeframe'),
            generateHeader('Production Coupling with Asset'),
            generateHeader('Consumption Coupling with Asset'),
            generateHeader('Min CO2 Offset'),
            generateHeader('Coupling Cap per Timeframe (kWh)'),
            generateHeader('Energy Demand (kWh)'),
        ];

        return (
            <div className="ForSaleWrapper">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    data={data}
                    actionWidth={55.39}
                    operations={Object.values(OPERATIONS)}
                    operationClicked={this.operationClicked}
                />
            </div>
        );
    }
}
