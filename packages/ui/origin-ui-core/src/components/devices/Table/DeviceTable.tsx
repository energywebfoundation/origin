import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Fab, Tooltip } from '@material-ui/core';
import { Add, Assignment, Check, Visibility } from '@material-ui/icons';
import { DeviceStatus, isRole, Role } from '@energyweb/origin-backend-core';
import { getConfiguration } from '../../../features/configuration';
import { approveDevice } from '../../../features/devices';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { moment } from '../../../utils/time';
import { NotificationTypeEnum, showNotification } from '../../../utils/notifications';
import { PowerFormatter } from '../../../utils/PowerFormatter';
import { getDeviceColumns } from '../../../utils/device';
import { IOriginDevice } from '../../../types';
import { RequestCertificatesModal } from '../../Modal';
import {
    checkRecordPassesFilters,
    CustomFilterInputType,
    ICustomFilterDefinition,
    IPaginatedLoaderFetchDataReturnValues,
    IPaginatedLoaderHooksFetchDataParameters,
    ITableAction,
    TableMaterial,
    usePaginatedLoaderFiltered,
    TableFallback
} from '../../Table';
import { fromGeneralSelectors, fromUsersSelectors } from '../../../features';
import { useLinks } from '../../../hooks';

interface IOwnProps {
    actions: {
        requestCertificates?: boolean;
        approve?: boolean;
    };
    devices: IOriginDevice[];
    owner?: number;
    showAddDeviceButton?: boolean;
    hiddenColumns?: string[];
    includedStatuses?: DeviceStatus[];
}

interface IDeviceRowData {
    owner: string;
    orgId: number;
    readCertified: string;
    readToBeCertified: string;
    gridOperator: string;
    facilityName: string;
    type: string;
    deviceLocation: string;
    capacity: string;
    status: DeviceStatus;
}

export const DeviceTable = (props: IOwnProps) => {
    const [detailViewForDeviceId, setDetailViewForDeviceId] = useState(null);
    const { getDeviceDetailsPageUrl } = useLinks();
    const configuration = useSelector(getConfiguration);
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const environment = useSelector(fromGeneralSelectors.getEnvironment);
    const exchangeDepositAddress = useSelector(fromUsersSelectors.getExchangeDepositAddress);
    const [showRequestCertModal, setShowRequestCertModal] = useState<boolean>(false);
    const [deviceForRequest, setDeviceForRequest] = useState<IOriginDevice>(null);
    const dispatch = useDispatch();

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const includedStatuses = props.includedStatuses || [];

        const filteredEnrichedDeviceData = props.devices.filter(
            (record) =>
                checkRecordPassesFilters(
                    record,
                    requestedFilters,
                    configuration.deviceTypeService
                ) &&
                (!props.owner || record?.organizationId === user?.organization?.id) &&
                (includedStatuses.length === 0 || includedStatuses.includes(record.status))
        );

        const total = filteredEnrichedDeviceData.length;

        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<IOriginDevice>({
        getPaginatedData
    });

    const { t } = useTranslation();

    useEffect(() => {
        loadPage(1);
    }, [user, props.devices]);

    function viewDevice(rowIndex: number) {
        const device = paginatedData[rowIndex];

        setDetailViewForDeviceId(device.id);
    }

    async function requestCerts(rowIndex: number) {
        const device = paginatedData[rowIndex];

        if (device.status !== DeviceStatus.Active) {
            return showNotification(
                `You can only request certificates for devices with status ${DeviceStatus.Active}.`,
                NotificationTypeEnum.Error
            );
        }

        setDeviceForRequest(device);
        setShowRequestCertModal(true);
    }

    async function approve(rowIndex: string) {
        const deviceToApprove: IOriginDevice = paginatedData[rowIndex];

        dispatch(approveDevice(deviceToApprove.id));

        await loadPage(1);
    }

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IOriginDevice) =>
                `${record?.facilityName}${record?.organizationName}`,
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

    const rows: IDeviceRowData[] = paginatedData.map((device) => ({
        owner: device.organizationName,
        orgId: device.organizationId,
        facilityName: device.facilityName,
        deviceLocation: device.locationText,
        type: configuration?.deviceTypeService?.getDisplayText(device.deviceType) ?? '',
        capacity: PowerFormatter.format(device.capacityInW),
        readCertified:
            device.meterStats === null
                ? 'Loading...'
                : EnergyFormatter.format(device.meterStats?.certified ?? 0),
        readToBeCertified:
            device.meterStats === null
                ? 'Loading...'
                : EnergyFormatter.format(device.meterStats?.uncertified ?? 0),
        status: device.status,
        gridOperator: device.gridOperator
    }));

    if (detailViewForDeviceId !== null) {
        return <Redirect push={true} to={getDeviceDetailsPageUrl(detailViewForDeviceId)} />;
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
            if (rowData.status === DeviceStatus.Active && rowData.orgId === user.organization.id) {
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

    if (configuration === null) {
        return <TableFallback />;
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
                            <Add data-cy="plus-device-button" />
                        </Fab>
                    </Tooltip>
                </Link>
            )}
            <RequestCertificatesModal
                showModal={showRequestCertModal}
                setShowModal={setShowRequestCertModal}
                device={deviceForRequest}
            />
        </>
    );
};
