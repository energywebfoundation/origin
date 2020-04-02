import React, { useEffect, useState } from 'react';
import { Role, isRole, DeviceStatus } from '@energyweb/origin-backend-core';
import { Link, Redirect } from 'react-router-dom';
import { ProducingDevice } from '@energyweb/device-registry';
import { useSelector, useDispatch } from 'react-redux';
import { Fab, Tooltip } from '@material-ui/core';
import { Add, Assignment, Check } from '@material-ui/icons';
import { checkRecordPassesFilters } from './Table/PaginatedLoaderFiltered';
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import { IPaginatedLoaderFetchDataReturnValues } from './Table/PaginatedLoader';
import { getProducingDevices, getBaseURL, getConfiguration } from '../features/selectors';
import { TableMaterial } from './Table/TableMaterial';
import { getUserOffchain, getOrganizations } from '../features/users/selectors';
import { showRequestCertificatesModal } from '../features/certificates/actions';
import { setLoading } from '../features/general/actions';
import { producingDeviceCreatedOrUpdated } from '../features/producingDevices/actions';
import {
    EnergyFormatter,
    PowerFormatter,
    getDeviceLocationText,
    LOCATION_TITLE_TRANSLATION_KEY,
    getProducingDeviceDetailLink,
    showNotification,
    NotificationType
} from '../utils';

import { useTranslation } from 'react-i18next';
import {
    usePaginatedLoaderFiltered,
    IPaginatedLoaderHooksFetchDataParameters
} from './Table/PaginatedLoaderHooks';

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

interface IEnrichedProducingDeviceData {
    device: ProducingDevice.Entity;
    organizationName: string;
    locationText: string;
}

export function ProducingDeviceTable(props: IOwnProps) {
    const [detailViewForDeviceId, setDetailViewForDeviceId] = useState(null);

    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const producingDevices = useSelector(getProducingDevices);
    const baseURL = useSelector(getBaseURL);
    const organizations = useSelector(getOrganizations);

    const dispatch = useDispatch();

    function enrichProducingDeviceData(): IEnrichedProducingDeviceData[] {
        const enriched: IEnrichedProducingDeviceData[] = [];

        for (const device of producingDevices) {
            const organization = organizations.find(o => o.id === device.organization);

            enriched.push({
                device,
                organizationName: organization?.name,
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
            record =>
                checkRecordPassesFilters(
                    record,
                    requestedFilters,
                    configuration.deviceTypeService
                ) &&
                (props.owner === null || record?.device?.organization === user?.organization?.id) &&
                (includedStatuses.length === 0 || includedStatuses.includes(record.device.status))
        );

        const total = filteredEnrichedDeviceData.length;

        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<
        IEnrichedProducingDeviceData
    >({
        getPaginatedData
    });

    const { t } = useTranslation();

    useEffect(() => {
        loadPage(1);
    }, [user, producingDevices, organizations]);

    function viewDevice(rowIndex: number) {
        const device = paginatedData[rowIndex].device;

        setDetailViewForDeviceId(device.id);
    }

    async function requestCerts(rowIndex: number) {
        dispatch(
            showRequestCertificatesModal({
                producingDevice: paginatedData[rowIndex].device
            })
        );
    }

    async function approve(rowIndex: number) {
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

    const columns = ([
        { id: 'owner', label: t('device.properties.owner') },
        { id: 'facilityName', label: t('device.properties.facilityName') },
        { id: 'provinceRegion', label: t(LOCATION_TITLE_TRANSLATION_KEY) },
        { id: 'type', label: t('device.properties.type') },
        {
            id: 'capacity',
            label: `${t('device.properties.nameplateCapacity')} (${PowerFormatter.displayUnit})`
        },
        { id: 'status', label: t('device.properties.status') },
        {
            id: 'read',
            label: `${t('device.properties.meterRead')} (${EnergyFormatter.displayUnit})`
        }
    ] as const).filter(column => !hiddenColumns.includes(column.id));

    const rows = paginatedData.map(enrichedData => ({
        owner: enrichedData.organizationName,
        facilityName: enrichedData.device.facilityName,
        provinceRegion: enrichedData.locationText,
        type:
            configuration?.deviceTypeService?.getDisplayText(enrichedData.device.deviceType) ?? '',
        capacity: PowerFormatter.format(enrichedData.device.capacityInW),
        read: EnergyFormatter.format(enrichedData.device.lastSmartMeterReadWh ?? 0),
        status: DeviceStatus[enrichedData.device.status]
    }));

    if (detailViewForDeviceId !== null) {
        return (
            <Redirect
                push={true}
                to={getProducingDeviceDetailLink(baseURL, detailViewForDeviceId)}
            />
        );
    }

    const actions = [];

    if (props.actions.requestCertificates && isRole(user, Role.DeviceManager)) {
        actions.push({
            icon: <Assignment />,
            name: t('device.actions.requestCertificates'),
            onClick: (row: number) => requestCerts(row)
        });
    }

    if (props.actions.approve && isRole(user, Role.Issuer)) {
        actions.push({
            icon: <Check />,
            name: t('device.actions.approve'),
            onClick: (row: number) => approve(row)
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
                handleRowClick={row => viewDevice(row)}
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
        </>
    );
}
