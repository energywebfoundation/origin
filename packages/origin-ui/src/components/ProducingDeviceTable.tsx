import React from 'react';

import { PurchasableCertificate, MarketUser } from '@energyweb/market';
import { Role } from '@energyweb/user-registry';
import { Redirect } from 'react-router-dom';
import { Configuration, Unit, LocationService } from '@energyweb/utils-general';
import { ProducingDevice } from '@energyweb/asset-registry';
import {
    PaginatedLoaderFiltered,
    IPaginatedLoaderFilteredState,
    getInitialPaginatedLoaderFilteredState
} from './Table/PaginatedLoaderFiltered';
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import { getProducingDeviceDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getConfiguration, getProducingDevices, getBaseURL } from '../features/selectors';
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
    producingDevices: ProducingDevice.Entity[];
    currentUser: MarketUser.Entity;
    users: MarketUser.Entity[];
    baseURL: string;
}

interface IDispatchProps {
    showRequestCertificatesModal: TShowRequestCertificatesModalAction;
}

type Props = IStateProps & IDispatchProps;

interface IEnrichedProducingDeviceData {
    device: ProducingDevice.Entity;
    organizationName: string;
    deviceProvince: string;
    deviceRegion: string;
}

interface IProducingDeviceTableState extends IPaginatedLoaderFilteredState {
    detailViewForDeviceId: string;
    showRequestIRECsModal: boolean;
    paginatedData: IEnrichedProducingDeviceData[];
}

class ProducingDeviceTableClass extends PaginatedLoaderFiltered<Props, IProducingDeviceTableState> {
    private locationService = new LocationService();

    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForDeviceId: null,
            showRequestIRECsModal: false
        };
    }

    async componentDidUpdate(newProps: Props) {
        if (
            newProps.producingDevices !== this.props.producingDevices ||
            newProps.users.length !== this.props.users.length
        ) {
            await this.loadPage(1);
        }
    }

    async enrichProducingDeviceData(
        producingDevices: ProducingDevice.Entity[]
    ): Promise<IEnrichedProducingDeviceData[]> {
        const promises = producingDevices.map(async device => {
            const user = getUserById(this.props.users, device.owner.address);

            let deviceRegion = '';
            let deviceProvince = '';
            try {
                const decodedLocation = this.locationService.decode([
                    this.locationService.translateAddress(
                        device.offChainProperties.address,
                        device.offChainProperties.country
                    )
                ])[0];

                deviceRegion = decodedLocation[1];
                deviceProvince = decodedLocation[2];
            } catch (error) {
                console.error('Error while parsing location', error);
            }

            return {
                device,
                organizationName: user?.organization,
                deviceProvince,
                deviceRegion
            };
        });

        return Promise.all(promises);
    }

    viewDevice(rowIndex: number) {
        const device = this.state.paginatedData[rowIndex].device;

        this.setState({
            detailViewForDeviceId: device.id
        });
    }

    async requestIRECs(rowIndex: number) {
        this.props.showRequestCertificatesModal({
            producingDevice: this.state.paginatedData[rowIndex].device
        });
    }

    filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedProducingDeviceData) =>
                `${record?.device?.offChainProperties?.facilityName}${record?.organizationName}`,
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
        const devices = this.props.producingDevices;
        const enrichedDeviceData = await this.enrichProducingDeviceData(devices);

        const filteredEnrichedDeviceData = enrichedDeviceData.filter(record =>
            this.checkRecordPassesFilters(record, filters)
        );

        const total = filteredEnrichedDeviceData.length;

        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + pageSize);

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
            facilityName: enrichedData.device.offChainProperties.facilityName,
            provinceRegion: `${enrichedData.deviceProvince}, ${enrichedData.deviceRegion}`,
            type: this.deviceTypeService.getDisplayText(
                enrichedData.device.offChainProperties.deviceType
            ),
            capacity: (
                enrichedData.device.offChainProperties.capacityWh / Unit.kWh
            ).toLocaleString(),
            read: (enrichedData.device.lastSmartMeterReadWh / Unit.kWh).toLocaleString()
        }));
    }

    render() {
        const { detailViewForDeviceId, total, pageSize } = this.state;

        if (detailViewForDeviceId !== null) {
            return (
                <Redirect
                    push={true}
                    to={getProducingDeviceDetailLink(this.props.baseURL, detailViewForDeviceId)}
                />
            );
        }

        const actions = [];

        if (this.props.currentUser && this.props.currentUser.isRole(Role.DeviceManager)) {
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
                    handleRowClick={(row: number) => this.viewDevice(row)}
                    actions={actions}
                />
            </div>
        );
    }
}

const mapDispatchToProps: IDispatchProps = {
    showRequestCertificatesModal
};

export const ProducingDeviceTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        certificates: getCertificates(state),
        producingDevices: getProducingDevices(state),
        users: getUsers(state),
        currentUser: getCurrentUser(state),
        baseURL: getBaseURL()
    }),
    mapDispatchToProps
)(ProducingDeviceTableClass);
