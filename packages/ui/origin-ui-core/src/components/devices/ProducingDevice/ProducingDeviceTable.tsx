import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProducingDevice } from '@energyweb/device-registry';
import { Fab, Tooltip } from '@material-ui/core';
import { Add, Assignment, Check, Visibility } from '@material-ui/icons';
import { DeviceStatus, isRole, Role } from '@energyweb/origin-backend-core';
import { getBackendClient, getEnvironment, setLoading } from '../../../features/general';
import { producingDeviceCreatedOrUpdated, getProducingDevices } from '../../../features/devices';
import { getBaseURL, getProducingDeviceDetailLink } from '../../../utils/routing';
import { getConfiguration } from '../../../features/configuration';

import { getExchangeDepositAddress, getUserOffchain } from '../../../features/users';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { moment } from '../../../utils/time';
import { NotificationType, showNotification } from '../../../utils/notifications';
import { PowerFormatter } from '../../../utils/PowerFormatter';
import { getDeviceColumns, getDeviceLocationText } from '../../../utils/device';

import { RequestCertificatesModal } from '../../Modal';
import {
    checkRecordPassesFilters,
    CustomFilterInputType,
    ICustomFilterDefinition,
    IPaginatedLoaderFetchDataReturnValues,
    IPaginatedLoaderHooksFetchDataParameters,
    ITableAction,
    TableMaterial,
    usePaginatedLoaderFiltered
} from '../../Table';

interface IOwnProps {
    actions: {
        requestCertificates?: boolean;
        approve?: boolean;
    };
    owner?: number;
    showAddDeviceButton?: boolean;
    hiddenColumns?: string[];
    includedStatuses?: DeviceStatus[];
}

interface IEnrichedProducingDeviceData {
    device: ProducingDevice.Entity;
    organizationName: string;
    locationText: string;
}

interface IDeviceRowData {
    owner: string;
    readCertified: string;
    readToBeCertified: string;
    gridOperator: string;
    facilityName: string;
    type: string;
    deviceLocation: string;
    capacity: string;
    status: DeviceStatus;
}

export function ProducingDeviceTable(props: IOwnProps) {
    const [detailViewForDeviceId, setDetailViewForDeviceId] = useState(null);

    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const producingDevices = useSelector(getProducingDevices);
    const baseURL = useSelector(getBaseURL);
    const environment = useSelector(getEnvironment);
    const exchangeDepositAddress = useSelector(getExchangeDepositAddress);
    const [showRequestCertModal, setShowRequestCertModal] = useState(false);
    const [producingDeviceForModal, setProducingDeviceForModal] = useState(null);
    const dispatch = useDispatch();
    const organizationClient = useSelector(getBackendClient)?.organizationClient;
    const organizationCache = new Map<number, string>();

    async function fetchOrganizationName(id: number): Promise<string> {
        if (organizationCache.has(id)) {
            return organizationCache.get(id);
        }

        const {
            data: { name }
        } = await organizationClient.getPublic(id);

        organizationCache.set(id, name);

        return name;
    }

    async function enrichProducingDeviceData(): Promise<IEnrichedProducingDeviceData[]> {
        const enriched: IEnrichedProducingDeviceData[] = [];
        for (const device of producingDevices) {
            enriched.push({
                device,
                organizationName: await fetchOrganizationName(device?.organizationId),
                locationText: getDeviceLocationText(device)
            });
        }

        return enriched;
    }

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedDeviceData = await enrichProducingDeviceData();

        const includedStatuses = props.includedStatuses || [];

        const filteredEnrichedDeviceData = enrichedDeviceData.filter(
            (record) =>
                checkRecordPassesFilters(
                    record,
                    requestedFilters,
                    configuration.deviceTypeService
                ) &&
                (!props.owner || record?.device?.organizationId === user?.organization?.id) &&
                (includedStatuses.length === 0 || includedStatuses.includes(record.device.status))
        );

        const total = filteredEnrichedDeviceData.length;

        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData,
            total
        };
    }

    const {
        paginatedData,
        loadPage,
        total,
        pageSize
    } = usePaginatedLoaderFiltered<IEnrichedProducingDeviceData>({
        getPaginatedData
    });

    const { t } = useTranslation();

    useEffect(() => {
        loadPage(1);
    }, [user, producingDevices]);

    function viewDevice(rowIndex: number) {
        const device = paginatedData[rowIndex].device;

        setDetailViewForDeviceId(device.id);
    }

    async function requestCerts(rowIndex: string) {
        const producingDevice = paginatedData[rowIndex].device;

        if (producingDevice.status !== DeviceStatus.Active) {
            return showNotification(
                `You can only request certificates for devices with status ${DeviceStatus.Active}.`,
                NotificationType.Error
            );
        }

        setProducingDeviceForModal(producingDevice);
        setShowRequestCertModal(true);
    }

    async function approve(rowIndex: string) {
        const producingDevice = paginatedData[rowIndex].device;

        dispatch(setLoading(true));

        try {
            await producingDevice.setStatus(DeviceStatus.Active);
            await dispatch(producingDeviceCreatedOrUpdated(await producingDevice.sync()));

            showNotification(`Device has been approved.`, NotificationType.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(
                `Unexpected error occurred when approving device.`,
                NotificationType.Error
            );
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedProducingDeviceData) =>
                `${record?.device?.facilityName}${record?.organizationName}`,
            label: t('search.searchByFacilityNameAndOrganization'),
            input: {
                type: CustomFilterInputType.string
            },
            search: true
        }
    ];

    const hiddenColumns = props.hiddenColumns || [];

    const currentYear = moment().format('YYYY');
    const isMay15orAfter = moment().isSameOrAfter(`${currentYear}-05-15`, 'day');
    const currentIRECYear = isMay15orAfter
        ? `${Number(currentYear)}/${Number(currentYear) + 1}`
        : `${Number(currentYear) - 1}/${Number(currentYear)}`;

    const columns = ([
        { id: 'owner', label: t('device.properties.owner') },
        { id: 'facilityName', label: t('device.properties.facilityName') },
        ...getDeviceColumns(environment, t),
        { id: 'type', label: t('device.properties.type') },
        {
            id: 'capacity',
            label: `${t('device.properties.nameplateCapacity')} (${PowerFormatter.displayUnit})`
        },
        { id: 'status', label: t('device.properties.status') },
        {
            id: 'readCertified',
            label: `${t('device.properties.meterReadCertified')} for ${currentIRECYear} (${
                EnergyFormatter.displayUnit
            })`
        },
        {
            id: 'readToBeCertified',
            label: `${t('device.properties.meterReadToBeCertified')} for ${currentIRECYear} (${
                EnergyFormatter.displayUnit
            })`
        }
    ] as const).filter((column) => !hiddenColumns.includes(column.id));

    const rows: IDeviceRowData[] = paginatedData.map((enrichedData) => ({
        owner: enrichedData.organizationName,
        facilityName: enrichedData.device.facilityName,
        deviceLocation: enrichedData.locationText,
        type:
            configuration?.deviceTypeService?.getDisplayText(enrichedData.device.deviceType) ?? '',
        capacity: PowerFormatter.format(enrichedData.device.capacityInW),
        readCertified: EnergyFormatter.format(enrichedData.device.meterStats?.certified ?? 0),
        readToBeCertified: EnergyFormatter.format(enrichedData.device.meterStats?.uncertified ?? 0),
        status: enrichedData.device.status,
        gridOperator: enrichedData?.device?.gridOperator
    }));

    if (detailViewForDeviceId !== null) {
        return (
            <Redirect
                push={true}
                to={getProducingDeviceDetailLink(baseURL, detailViewForDeviceId)}
            />
        );
    }

    const actions: (ITableAction | ((row: IDeviceRowData) => ITableAction))[] = [];

    actions.push({
        icon: <Visibility />,
        name: t('device.actions.viewDetails'),
        onClick: viewDevice
    });

    if (
        exchangeDepositAddress &&
        props.actions.requestCertificates &&
        isRole(user, Role.OrganizationDeviceManager, Role.OrganizationAdmin)
    ) {
        actions.push((rowData) => {
            if (rowData.status === DeviceStatus.Active) {
                return {
                    icon: <Assignment />,
                    name: t('device.actions.requestCertificates'),
                    onClick: requestCerts
                };
            }
        });
    }

    if (props.actions.approve && isRole(user, Role.Issuer)) {
        actions.push({
            icon: <Check />,
            name: t('device.actions.approve'),
            onClick: approve
        });
    }

    return (
        <>
            <TableMaterial
                columns={columns}
                rows={rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                filters={filters}
                handleRowClick={(index) => viewDevice(parseInt(index, 10))}
                actions={actions}
            />
            {props.showAddDeviceButton && (
                <Link to={'/devices/add'}>
                    <Tooltip title={t('device.actions.registerDevice')}>
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
            <RequestCertificatesModal
                showModal={showRequestCertModal}
                setShowModal={setShowRequestCertModal}
                producingDevice={producingDeviceForModal}
            />
        </>
    );
}
