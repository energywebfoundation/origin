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

import { Certificate, CertificateLogic } from '@energyweb/origin';
import { User, Role } from '@energyweb/user-registry';
import { Redirect } from 'react-router-dom';
import { ITableHeaderData } from './Table/Table';
import TableUtils from './Table/TableUtils';
import { Configuration } from '@energyweb/utils-general';
import { ProducingAsset } from '@energyweb/asset-registry';
import { showNotification, NotificationType } from '../utils/notifications';
import { RequestIRECsModal } from '../elements/Modal/RequestIRECsModal';
import {
    PaginatedLoaderFiltered,
    IPaginatedLoaderFilteredState,
    getInitialPaginatedLoaderFilteredState,
    FILTER_SPECIAL_TYPES,
    RECORD_INDICATOR
} from './Table/PaginatedLoaderFiltered';
import { AdvancedTable } from './Table/AdvancedTable';
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import { getProducingAssetDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getConfiguration, getCertificates, getProducingAssets, getCurrentUser, getBaseURL } from '../features/selectors';

interface IStateProps {
    configuration: Configuration.Entity;
    certificates: Certificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: User.Entity;
    baseURL: string;
}

type Props = IStateProps;

interface IEnrichedProducingAssetData {
    asset: ProducingAsset.Entity;
    organizationName: string;
    notSoldCertificates: Certificate.Entity[];
}

interface IProducingAssetTableState extends IPaginatedLoaderFilteredState {
    detailViewForAssetId: number;
    requestIRECsModalAsset: ProducingAsset.Entity;
    showRequestIRECsModal: boolean;
}

enum OPERATIONS {
    REQUEST_IRECS = 'Request I-RECs',
    SHOW_DETAILS = 'Show Details'
}

class ProducingAssetTableClass extends PaginatedLoaderFiltered<
    Props,
    IProducingAssetTableState
> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForAssetId: null,
            requestIRECsModalAsset: null,
            showRequestIRECsModal: false
        };

        this.operationClicked = this.operationClicked.bind(this);
        this.hideRequestIRECsModal = this.hideRequestIRECsModal.bind(this);
    }

    async componentDidUpdate(newProps: Props) {
        if (newProps.producingAssets !== this.props.producingAssets) {
            await this.loadPage(1);
        }
    }

    async enrichProducingAssetData(
        producingAssets: ProducingAsset.Entity[]
    ): Promise<IEnrichedProducingAssetData[]> {
        const promises = producingAssets.map(async asset => {
            const user = await new User.Entity(asset.owner.address, this.props.configuration).sync();

            return {
                asset,
                notSoldCertificates: this.props.certificates.filter(
                    (certificate: Certificate.Entity) =>
                        certificate.owner === asset.owner.address &&
                        certificate.assetId.toString() === asset.id
                ),
                organizationName: user.organization
            };
        });

        return Promise.all(promises);
    }

    operationClicked(key: string, id: number): void {
        switch (key) {
            case OPERATIONS.REQUEST_IRECS:
                this.requestIRECs(id);
                break;
            default:
                this.setState({
                    detailViewForAssetId: id
                });
                break;
        }
    }

    async requestIRECs(id: number) {
        const asset: ProducingAsset.Entity = this.props.producingAssets.find(
            (a: ProducingAsset.Entity) => a.id === id.toString()
        );

        let isOwner =
            asset.owner &&
            asset.owner.address.toLowerCase() === this.props.currentUser.id.toLowerCase();
        if (!isOwner) {
            showNotification(
                `You need to own the asset to request I-RECs.`,
                NotificationType.Error
            );

            return;
        }

        let hasRights = this.props.currentUser.isRole(Role.AssetManager);
        if (!hasRights) {
            showNotification(
                `You need to have Asset Manager role to request I-RECs.`,
                NotificationType.Error
            );

            return;
        }

        const reads = await asset.getSmartMeterReads();

        if (reads.length === 0) {
            showNotification(
                `There are no smart meter reads for this asset.`,
                NotificationType.Error
            );

            return;
        }

        const certificateLogic: CertificateLogic = this.props.configuration.blockchainProperties
            .certificateLogicInstance;

        const lastRequestedSMReadIndex = Number(
            await certificateLogic.getAssetRequestedCertsForSMReadsLength(Number(asset.id))
        );

        if (reads.length === lastRequestedSMReadIndex) {
            showNotification(
                `You have already requested certificates for all smart meter reads for this asset.`,
                NotificationType.Error
            );

            return;
        }

        asset.configuration.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        this.setState({
            requestIRECsModalAsset: asset,
            showRequestIRECsModal: true
        });
    }

    hideRequestIRECsModal() {
        this.setState({
            requestIRECsModalAsset: null,
            showRequestIRECsModal: false
        });
    }

    filters: ICustomFilterDefinition[] = [
        {
            property: `${FILTER_SPECIAL_TYPES.COMBINE}::${RECORD_INDICATOR}asset.offChainProperties.facilityName::${RECORD_INDICATOR}organizationName`,
            label: 'Search',
            input: {
                type: CustomFilterInputType.string
            },
            search: true
        }
    ];

    async getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const assets = this.props.producingAssets;
        const enrichedAssetData = await this.enrichProducingAssetData(assets);

        const filteredEnrichedAssetData = enrichedAssetData.filter(record =>
            this.checkRecordPassesFilters(record, filters)
        );

        const total = filteredEnrichedAssetData.length;

        const paginatedData = filteredEnrichedAssetData.slice(offset, offset + pageSize);

        const formattedPaginatedData = paginatedData.map(enrichedRecordData => {
            const asset = enrichedRecordData.asset;

            return [
                asset.id,
                enrichedRecordData.organizationName,
                asset.offChainProperties.facilityName,
                asset.offChainProperties.city + ', ' + asset.offChainProperties.country,
                ProducingAsset.Type[asset.offChainProperties.assetType],
                asset.offChainProperties.capacityWh / 1000,
                asset.lastSmartMeterReadWh / 1000
            ];
        });

        return {
            formattedPaginatedData,
            paginatedData,
            total
        };
    }

    render(): JSX.Element {
        if (this.state.detailViewForAssetId !== null) {
            return (
                <Redirect
                    push={true}
                    to={getProducingAssetDetailLink(this.props.baseURL, this.state.detailViewForAssetId.toString())}
                />
            );
        }

        const generateHeader = TableUtils.generateHeader;
        const generateFooter: any = TableUtils.generateFooter;

        const TableHeader: ITableHeaderData[] = [
            generateHeader('#', 60),
            generateHeader('Owner'),
            generateHeader('Facility Name'),
            generateHeader('Town, Country'),
            generateHeader('Type', 140),
            generateHeader('Nameplate Capacity (kW)', 125.45, true),
            generateHeader('Meter Read (kWh)', 135.89, true)
        ];

        const TableFooter: any = [
            {
                label: 'Total',
                key: 'total',
                colspan: 6
            },
            generateFooter('Meter Read (kWh)')
        ];

        const operations = [OPERATIONS.SHOW_DETAILS];

        if (this.props.currentUser && this.props.currentUser.isRole(Role.AssetManager)) {
            operations.push(OPERATIONS.REQUEST_IRECS);
        }

        return (
            <div className="ProductionWrapper">
                <AdvancedTable
                    header={TableHeader}
                    footer={TableFooter}
                    operationClicked={this.operationClicked}
                    actions={true}
                    data={this.state.formattedPaginatedData}
                    operations={operations}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                    filters={this.filters}
                />

                <RequestIRECsModal
                    conf={this.props.configuration}
                    producingAsset={this.state.requestIRECsModalAsset}
                    showModal={this.state.showRequestIRECsModal}
                    callback={this.hideRequestIRECsModal}
                />
            </div>
        );
    }
}

export const ProducingAssetTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        certificates: getCertificates(state),
        producingAssets: getProducingAssets(state),
        currentUser: getCurrentUser(state),
        baseURL: getBaseURL(state)
    })
)(ProducingAssetTableClass);
