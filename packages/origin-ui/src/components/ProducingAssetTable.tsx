import React from 'react';

import { PurchasableCertificate, MarketUser } from '@energyweb/market';
import { Role } from '@energyweb/user-registry';
import { Redirect } from 'react-router-dom';
import { Configuration, Unit, LocationService } from '@energyweb/utils-general';
import { ProducingAsset } from '@energyweb/asset-registry';
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
import { Assignment } from '@material-ui/icons';
import { TableMaterial } from './Table/TableMaterial';
import { getUsers, getUserById, getCurrentUser } from '../features/users/selectors';
import { getCertificates } from '../features/certificates/selectors';
import {
    showRequestCertificatesModal,
    TShowRequestCertificatesModalAction
} from '../features/certificates/actions';

interface IStateProps {
    configuration: Configuration.Entity;
    certificates: PurchasableCertificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: MarketUser.Entity;
    users: MarketUser.Entity[];
    baseURL: string;
}

interface IDispatchProps {
    showRequestCertificatesModal: TShowRequestCertificatesModalAction;
}

type Props = IStateProps & IDispatchProps;

interface IEnrichedProducingAssetData {
    asset: ProducingAsset.Entity;
    organizationName: string;
    assetProvince: string;
    assetRegion: string;
}

interface IProducingAssetTableState extends IPaginatedLoaderFilteredState {
    detailViewForAssetId: string;
    showRequestIRECsModal: boolean;
    paginatedData: IEnrichedProducingAssetData[];
}

class ProducingAssetTableClass extends PaginatedLoaderFiltered<Props, IProducingAssetTableState> {
    private locationService = new LocationService();

    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForAssetId: null,
            showRequestIRECsModal: false
        };
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

            let assetRegion = '';
            let assetProvince = '';
            try {
                const decodedLocation = this.locationService.decode([
                    this.locationService.translateAddress(
                        asset.offChainProperties.address,
                        asset.offChainProperties.country
                    )
                ])[0];

                assetRegion = decodedLocation[1];
                assetProvince = decodedLocation[2];
            } catch (error) {
                console.error('Error while parsing location', error);
            }

            return {
                asset,
                organizationName: user?.organization,
                assetProvince,
                assetRegion
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
        this.props.showRequestCertificatesModal({
            producingAsset: this.state.paginatedData[rowIndex].asset
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
        { id: 'provinceRegion', label: 'Province, region' },
        { id: 'type', label: 'Type' },
        { id: 'capacity', label: 'Nameplate capacity (kW)' },
        { id: 'read', label: 'Meter read (kWh)' }
    ] as const;

    get rows() {
        return this.state.paginatedData.map(enrichedData => ({
            owner: enrichedData.organizationName,
            facilityName: enrichedData.asset.offChainProperties.facilityName,
            provinceRegion: `${enrichedData.assetProvince}, ${enrichedData.assetRegion}`,
            type: this.assetTypeService.getDisplayText(
                enrichedData.asset.offChainProperties.assetType
            ),
            capacity: (
                enrichedData.asset.offChainProperties.capacityWh / Unit.kWh
            ).toLocaleString(),
            read: (enrichedData.asset.lastSmartMeterReadWh / Unit.kWh).toLocaleString()
        }));
    }

    render() {
        const { detailViewForAssetId, total, pageSize } = this.state;

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
                icon: <Assignment />,
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
            </div>
        );
    }
}

const mapDispatchToProps: IDispatchProps = {
    showRequestCertificatesModal
};

export const ProducingAssetTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        certificates: getCertificates(state),
        producingAssets: getProducingAssets(state),
        users: getUsers(state),
        currentUser: getCurrentUser(state),
        baseURL: getBaseURL()
    }),
    mapDispatchToProps
)(ProducingAssetTableClass);
