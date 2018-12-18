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

import * as React from 'react';

import * as General from 'ew-utils-general-lib';
import * as OriginIssuer from 'ew-origin-lib';
import * as Market from 'ew-market-lib';
import * as EwUser from 'ew-user-registry-lib';
import * as EwAsset from 'ew-asset-registry-lib'; 
import { OrganizationFilter } from './OrganizationFilter';
import { BrowserRouter, Route, Link, NavLink, Redirect } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import FadeIn from 'react-fade-in';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';

export interface ProducingAssetTableProps {
    conf: General.Configuration.Entity;
    certificates: OriginIssuer.Certificate.Entity[];
    producingAssets: EwAsset.ProducingAsset.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
    switchedToOrganization: boolean;
}

export interface ProducingAssetTableState {
    enrichedProducingAssetData: EnrichedProducingAssetData[];
    detailViewForAssetId: number;

}

export interface EnrichedProducingAssetData {
    producingAsset: EwAsset.ProducingAsset.Entity;
    organizationName: string;
    notSoldCertificates: OriginIssuer.Certificate.Entity[];

}

export class ProducingAssetTable extends React.Component<ProducingAssetTableProps, {}> {

    state: ProducingAssetTableState;

    constructor(props: ProducingAssetTableProps) {
        super(props);

        this.state = {
            enrichedProducingAssetData: [],
            detailViewForAssetId: null
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.operationClicked = this.operationClicked.bind(this);

    }

    switchToOrganization(switchedToOrganization: boolean): void {
        this.setState({
            switchedToOrganization: switchedToOrganization
        });
    }

    async componentDidMount(): Promise<void> {
        await this.getOrganizationNames(this.props);

    }

    async componentWillReceiveProps(newProps: ProducingAssetTableProps): Promise<void>  {
        await this.getOrganizationNames(newProps);
    }

    async getOrganizationNames(props: ProducingAssetTableProps): Promise<void>  {

        const promieses = props.producingAssets.map(async (producingAsset: EwAsset.ProducingAsset.Entity, index: number) =>
            ({
                producingAsset: producingAsset,
                notSoldCertificates: this.props.certificates
                    .filter((certificate: OriginIssuer.Certificate.Entity) => 
                        certificate.owner === producingAsset.owner && certificate.assetId.toString() === producingAsset.id
                    ),
                organizationName: (await (new EwUser.User(producingAsset.owner.address, props.conf))
                        .sync()
                    ).organization
            })
        );

        Promise.all(promieses).then((enrichedProducingAssetData) =>
            this.setState({
                enrichedProducingAssetData: enrichedProducingAssetData
            })
        );

    }

    operationClicked(key: string, id: number): void {
        this.setState({
            detailViewForAssetId: id
        });

    }

    render(): JSX.Element {
        if (this.state.detailViewForAssetId !== null) {
            return <Redirect push to={'/' + this.props.baseUrl + '/assets/producing_detail_view/' + this.state.detailViewForAssetId} />;
        }

        const defaultWidth: number = 106;
        const getKey: any = TableUtils.getKey;
        const generateHeader: Function = (label, width = defaultWidth, right = false, body = false) =>
            (TableUtils.generateHeader(label, width, right, body));
        const generateFooter: any = TableUtils.generateFooter;

        const TableHeader: any[] = [
            generateHeader('#', 137.11),
            generateHeader('Owner', 136),
            generateHeader('Town, Country', 136),
            generateHeader('Type', 72),
            generateHeader('Nameplate Capacity (kW)', 125.45, true),
            generateHeader('Meter Read (kWh)', 135.89, true)

        ];

        const TableFooter: any = [
            {
                label: 'Total',
                key: 'total',
                colspan: 5
            },
            generateFooter('Meter Read (kWh)')
         
        ];

        const assets = null;
        const total = null;

        let totalSold = 0;
        let totalNotSold = 0;

        const accumulatorCb = (accumulator, currentValue) => accumulator + currentValue;

        const filteredEnrichedAssetData = this.state.enrichedProducingAssetData
            .filter((enrichedProducingAssetData: EnrichedProducingAssetData) => {

                return !this.props.switchedToOrganization 
                    || enrichedProducingAssetData.producingAsset.owner.address === this.props.currentUser.id;

            });

        let data = [];
        data = filteredEnrichedAssetData.map((enrichedProducingAssetData: EnrichedProducingAssetData) => {
            const producingAsset = enrichedProducingAssetData.producingAsset;
            const generatedKWh = producingAsset.certificatesCreatedForWh / 1000;
            const kWhForSale = enrichedProducingAssetData.notSoldCertificates.length < 1 ? 
                0 : enrichedProducingAssetData.notSoldCertificates
                    .map((certificate: OriginIssuer.Certificate.Entity) => certificate.powerInW)
                    .reduce(accumulatorCb) / 1000;

            totalSold += generatedKWh - kWhForSale;
            totalNotSold += kWhForSale;

            return ([
                producingAsset.id,
                enrichedProducingAssetData.organizationName,
                (producingAsset.offChainProperties.city + ', ' + producingAsset.offChainProperties.country),
                EwAsset.ProducingAsset.Type[producingAsset.offChainProperties.assetType],
                (producingAsset.offChainProperties.capacityWh / 1000).toFixed(3),
                (producingAsset.lastSmartMeterReadWh / 1000).toFixed(3) 
                
            ]);

        });

        const operations = ['Show Details'];

        return <div className='ProductionWrapper'>
            <Table 
                header={TableHeader}
                footer={TableFooter}
                operationClicked={this.operationClicked}
                actions={true}
                data={data}
                operations={operations} 
            />
        </div>;

    }

}