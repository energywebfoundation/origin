import * as React from 'react';

import { Certificate, CertificateLogic } from '@energyweb/origin';
import { User, Role } from '@energyweb/user-registry';
import { Redirect } from 'react-router-dom';
import { Configuration, Unit } from '@energyweb/utils-general';
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
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import { getProducingAssetDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getConfiguration, getProducingAssets, getBaseURL } from '../features/selectors';
import { Share } from '@material-ui/icons';
import { TableMaterial } from './Table/TableMaterial';
import { getUsers, getUserById, getCurrentUser } from '../features/users/selectors';
import { getCertificates } from '../features/certificates/selectors';

interface IStateProps {
    configuration: Configuration.Entity;
    certificates: Certificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: User.Entity;
    users: User.Entity[];
    baseURL: string;
}

type Props = IStateProps;

interface IEnrichedProducingAssetData {
    asset: ProducingAsset.Entity;
    organizationName: string;
}

interface IProducingAssetTableState extends IPaginatedLoaderFilteredState {
    detailViewForAssetId: string;
    requestIRECsModalAsset: ProducingAsset.Entity;
    showRequestIRECsModal: boolean;
    paginatedData: IEnrichedProducingAssetData[];
}

class ProducingAssetTableClass extends PaginatedLoaderFiltered<Props, IProducingAssetTableState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForAssetId: null,
            requestIRECsModalAsset: null,
            showRequestIRECsModal: false
        };

        this.hideRequestIRECsModal = this.hideRequestIRECsModal.bind(this);
    }

    async componentDidUpdate(newProps: Props) {
        if (
            newProps.producingAssets !== this.props.producingAssets ||
            newProps.users.length !== this.props.users.length
        ) {
            await this.loadPage(1);
        }
    }

    async enrichProducingAssetData(
        producingAssets: ProducingAsset.Entity[]
    ): Promise<IEnrichedProducingAssetData[]> {
        const promises = producingAssets.map(async asset => {
            const user = getUserById(this.props.users, asset.owner.address);

            return {
                asset,
                organizationName: user && user.organization
            };
        });

        return Promise.all(promises);
    }

    viewAsset(rowIndex: number) {
        const asset = this.state.paginatedData[rowIndex].asset;

        this.setState({
            detailViewForAssetId: asset.id
        });
    }

    async requestIRECs(rowIndex: number) {
        const asset = this.state.paginatedData[rowIndex].asset;

        const isOwner =
            asset.owner &&
            asset.owner.address.toLowerCase() === this.props.currentUser.id.toLowerCase();
        if (!isOwner) {
            showNotification(
                `You need to own the asset to request I-RECs.`,
                NotificationType.Error
            );

            return;
        }

        const hasRights = this.props.currentUser.isRole(Role.AssetManager);
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

        return {
            paginatedData,
            total
        };
    }

    columns = [
        { id: 'owner', label: 'Owner' },
        { id: 'facilityName', label: 'Facility name' },
        { id: 'townCountry', label: 'Town, country' },
        { id: 'type', label: 'Type' },
        { id: 'capacity', label: 'Nameplate capacity (kW)' },
        { id: 'read', label: 'Meter read (kWh)' }
    ] as const;

    get rows() {
        return this.state.paginatedData.map(enrichedData => {
            return {
                owner: enrichedData.organizationName,
                facilityName: enrichedData.asset.offChainProperties.facilityName,
                townCountry:
                    enrichedData.asset.offChainProperties.city +
                    ', ' +
                    enrichedData.asset.offChainProperties.country,
                type: enrichedData.asset.offChainProperties.assetType,
                capacity: (
                    enrichedData.asset.offChainProperties.capacityWh / Unit.kWh
                ).toLocaleString(),
                read: (enrichedData.asset.lastSmartMeterReadWh / Unit.kWh).toLocaleString()
            };
        });
    }

    render(): JSX.Element {
        const {
            detailViewForAssetId,
            total,
            pageSize,
            requestIRECsModalAsset,
            showRequestIRECsModal
        } = this.state;

        if (detailViewForAssetId !== null) {
            return (
                <Redirect
                    push={true}
                    to={getProducingAssetDetailLink(this.props.baseURL, detailViewForAssetId)}
                />
            );
        }

        const actions = [];

        if (this.props.currentUser && this.props.currentUser.isRole(Role.AssetManager)) {
            actions.push({
                icon: <Share />,
                name: 'Request I-RECs',
                onClick: (row: number) => this.requestIRECs(row)
            });
        }

        return (
            <div className="ProductionWrapper">
                <TableMaterial
                    columns={this.columns}
                    rows={this.rows}
                    loadPage={this.loadPage}
                    total={total}
                    pageSize={pageSize}
                    filters={this.filters}
                    handleRowClick={(row: number) => this.viewAsset(row)}
                    actions={actions}
                />

                <RequestIRECsModal
                    conf={this.props.configuration}
                    producingAsset={requestIRECsModalAsset}
                    showModal={showRequestIRECsModal}
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
        users: getUsers(state),
        currentUser: getCurrentUser(state),
        baseURL: getBaseURL(state)
    })
)(ProducingAssetTableClass);
