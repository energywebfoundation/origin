import React from 'react';
import { PurchasableCertificate, MarketUser } from '@energyweb/market';
import { Role } from '@energyweb/user-registry';
import { Link, Redirect } from 'react-router-dom';
import { Configuration } from '@energyweb/utils-general';
import { ProducingDevice } from '@energyweb/device-registry';
import { connect } from 'react-redux';
import { Fab, Tooltip } from '@material-ui/core';
import { Add, Assignment, Check } from '@material-ui/icons';

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
import { IStoreState } from '../types';
import { getConfiguration, getProducingDevices, getBaseURL } from '../features/selectors';
import { TableMaterial } from './Table/TableMaterial';
import { getUsers, getUserById, getCurrentUser } from '../features/users/selectors';
import { getCertificates } from '../features/certificates/selectors';
import {
    showRequestCertificatesModal,
    TShowRequestCertificatesModalAction
} from '../features/certificates/actions';
import { getDeviceLocationText, LOCATION_TITLE } from '../utils/helper';
import { showNotification, NotificationType } from '../utils/notifications';
import { setLoading, TSetLoading } from '../features/general/actions';
import {
    producingDeviceCreatedOrUpdated,
    TProducingDeviceCreatedOrUpdated
} from '../features/producingDevices/actions';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { PowerFormatter } from '../utils/PowerFormatter';
import { IOrganizationClient } from '@energyweb/origin-backend-client';
import { getOffChainDataSource } from '../features/general/selectors';
import { DeviceStatus } from '@energyweb/origin-backend-core';

interface IOwnProps {
    actions: {
        requestCertificates?: boolean;
        approve?: boolean;
    };
    owner?: string;
    showAddDeviceButton?: boolean;
    hiddenColumns?: string[];
    includedStatuses?: DeviceStatus[];
}

interface IStateProps {
    configuration: Configuration.Entity;
    certificates: PurchasableCertificate.Entity[];
    producingDevices: ProducingDevice.Entity[];
    currentUser: MarketUser.Entity;
    users: MarketUser.Entity[];
    baseURL: string;
    organizationClient: IOrganizationClient;
}

interface IDispatchProps {
    showRequestCertificatesModal: TShowRequestCertificatesModalAction;
    setLoading: TSetLoading;
    producingDeviceCreatedOrUpdated: TProducingDeviceCreatedOrUpdated;
}

type Props = IOwnProps & IStateProps & IDispatchProps;

interface IEnrichedProducingDeviceData {
    device: ProducingDevice.Entity;
    organizationName: string;
    locationText: string;
}

interface IProducingDeviceTableState extends IPaginatedLoaderFilteredState {
    detailViewForDeviceId: string;
    showRequestCertificatesModal: boolean;
    paginatedData: IEnrichedProducingDeviceData[];
}

class ProducingDeviceTableClass extends PaginatedLoaderFiltered<Props, IProducingDeviceTableState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForDeviceId: null,
            showRequestCertificatesModal: false
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

            const organization = await this.props.organizationClient?.getById(
                user?.information?.organization
            );

            return {
                device,
                organizationName: organization?.name,
                locationText: getDeviceLocationText(device)
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

    async requestCerts(rowIndex: number) {
        this.props.showRequestCertificatesModal({
            producingDevice: this.state.paginatedData[rowIndex].device
        });
    }

    async approve(rowIndex: number) {
        const producingDevice: ProducingDevice.Entity = this.state.paginatedData[rowIndex].device;

        this.props.setLoading(true);

        try {
            await producingDevice.setStatus(DeviceStatus.Active);
            await this.props.producingDeviceCreatedOrUpdated(await producingDevice.sync());

            showNotification(`Device has been approved.`, NotificationType.Success);

            await this.loadPage(1);
        } catch (error) {
            showNotification(
                `Unexpected error occurred when approving device.`,
                NotificationType.Error
            );
            console.error(error);
        }

        this.props.setLoading(false);
    }

    filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedProducingDeviceData) =>
                `${record?.device?.offChainProperties?.facilityName}${record?.organizationName}`,
            label: 'Search by facility name and organization',
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

        const includedStatuses = this.props.includedStatuses || [];

        const filteredEnrichedDeviceData = enrichedDeviceData.filter(
            record =>
                this.checkRecordPassesFilters(record, filters) &&
                (!this.props.owner ||
                    record?.device?.owner?.address?.toLowerCase() ===
                        this.props.currentUser?.id?.toLowerCase()) &&
                (includedStatuses.length === 0 ||
                    includedStatuses.includes(record.device.offChainProperties.status))
        );

        const total = filteredEnrichedDeviceData.length;

        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + pageSize);

        return {
            paginatedData,
            total
        };
    }

    get columns() {
        const hiddenColumns = this.props.hiddenColumns || [];

        return ([
            { id: 'owner', label: 'Owner' },
            { id: 'facilityName', label: 'Facility name' },
            { id: 'provinceRegion', label: LOCATION_TITLE },
            { id: 'type', label: 'Type' },
            { id: 'capacity', label: `Nameplate capacity (${PowerFormatter.displayUnit})` },
            { id: 'status', label: 'Status' },
            { id: 'read', label: `Meter read (${EnergyFormatter.displayUnit})` }
        ] as const).filter(column => !hiddenColumns.includes(column.id));
    }

    get rows() {
        return this.state.paginatedData.map(enrichedData => ({
            owner: enrichedData.organizationName,
            facilityName: enrichedData.device.offChainProperties.facilityName,
            provinceRegion: enrichedData.locationText,
            type:
                this.props.configuration?.deviceTypeService?.getDisplayText(
                    enrichedData.device.offChainProperties.deviceType
                ) ?? '',
            capacity: PowerFormatter.format(enrichedData.device.offChainProperties.capacityInW),
            read: EnergyFormatter.format(enrichedData.device.lastSmartMeterReadWh),
            status: DeviceStatus[enrichedData.device.offChainProperties.status]
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

        if (
            this.props.actions.requestCertificates &&
            this.props.currentUser?.isRole(Role.DeviceManager)
        ) {
            actions.push({
                icon: <Assignment />,
                name: 'Request Certificates',
                onClick: (row: number) => this.requestCerts(row)
            });
        }

        if (this.props.actions.approve && this.props.currentUser?.isRole(Role.Issuer)) {
            actions.push({
                icon: <Check />,
                name: 'Approve',
                onClick: (row: number) => this.approve(row)
            });
        }

        return (
            <>
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
                {this.props.showAddDeviceButton && (
                    <Link to={'/devices/add'}>
                        <Tooltip title="Register device">
                            <Fab
                                color="primary"
                                aria-label="add"
                                style={{ position: 'relative', marginTop: '20px', float: 'right' }}
                            >
                                <Add />
                            </Fab>
                        </Tooltip>
                    </Link>
                )}
            </>
        );
    }
}

const mapDispatchToProps: IDispatchProps = {
    showRequestCertificatesModal,
    setLoading,
    producingDeviceCreatedOrUpdated
};

export const ProducingDeviceTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        certificates: getCertificates(state),
        producingDevices: getProducingDevices(state),
        users: getUsers(state),
        currentUser: getCurrentUser(state),
        baseURL: getBaseURL(),
        organizationClient: getOffChainDataSource(state)?.organizationClient
    }),
    mapDispatchToProps
)(ProducingDeviceTableClass);
