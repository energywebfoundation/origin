import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DeviceStatus, isRole, Role } from '@energyweb/origin-backend-core';
import { Fab, Tooltip } from '@material-ui/core';
import { Add, Assignment, Visibility } from '@material-ui/icons';
import {
    checkRecordPassesFilters,
    CustomFilterInputType,
    EnergyFormatter,
    getConfiguration,
    ICustomFilterDefinition,
    IPaginatedLoaderFetchDataReturnValues,
    IPaginatedLoaderHooksFetchDataParameters,
    ITableAction,
    moment,
    NotificationTypeEnum,
    PowerFormatter,
    showNotification,
    // TODO  !SHOULD BE REMOVED!
    fromUsersSelectors,
    useLinks,
    TableMaterial,
    usePaginatedLoaderFiltered
} from '@energyweb/origin-ui-core';
import { getEnvironment } from '../../../features/general';
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-client';
import { getDeviceColumns } from '../../../utils/device';
import { ComposedDevice, ComposedPublicDevice } from '../../../types';
import { RequestCertificatesModal } from '../../Modal/RequestCertificatesModal';

interface IOwnProps {
    actions: {
        requestCertificates?: boolean;
        approve?: boolean;
    };
    devices: ComposedDevice[] | ComposedPublicDevice[];
    owner?: number;
    showAddDeviceButton?: boolean;
    hiddenColumns?: string[];
    includedStatuses?: DeviceState[];
}

interface IEnrichedDeviceData {
    device: ComposedDevice | ComposedPublicDevice;
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
    status: DeviceState;
}

export const DeviceTable = (props: IOwnProps) => {
    const { devices } = props;
    const [detailViewForDeviceId, setDetailViewForDeviceId] = useState(null);
    const configuration = useSelector(getConfiguration);
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const environment = useSelector(getEnvironment);
    const exchangeDepositAddress = useSelector(fromUsersSelectors.getExchangeDepositAddress);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [deviceForModal, setDeviceForModal] = useState(null);
    const { getDeviceDetailsPageUrl } = useLinks();

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const includedStatuses = props.includedStatuses || [];

        const filteredEnrichedDeviceData =
            devices?.filter(
                (record) =>
                    checkRecordPassesFilters(
                        record,
                        requestedFilters,
                        configuration?.deviceTypeService
                    ) &&
                    (!props.owner ||
                        // check if its true later
                        record?.ownerId === user?.organization?.id.toString()) &&
                    (includedStatuses.length === 0 || includedStatuses.includes(record.status))
            ) || [];

        const total = filteredEnrichedDeviceData.length;
        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<ComposedDevice>(
        {
            getPaginatedData
        }
    );

    const { t } = useTranslation();

    useEffect(() => {
        loadPage(1);
    }, [user, devices]);

    function viewDevice(rowIndex: number) {
        setDetailViewForDeviceId(paginatedData[rowIndex].id);
    }

    async function requestCerts(rowIndex: string) {
        const targetDevice = paginatedData[rowIndex].device;
        if (targetDevice.status !== DeviceStatus.Active) {
            return showNotification(
                `You can only request certificates for devices with status ${DeviceStatus.Active}.`,
                NotificationTypeEnum.Error
            );
        }
        setDeviceForModal(targetDevice);
        setShowRequestModal(true);
    }

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedDeviceData) =>
                `${record?.device?.name}${record?.organizationName}`,
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
        owner: enrichedData.registrantOrganization,
        facilityName: enrichedData.name,
        deviceLocation: enrichedData.address,
        type: enrichedData.deviceType ?? '',
        // type: configuration?.deviceTypeService?.getDisplayText(enrichedData.deviceType) ?? '',
        capacity: PowerFormatter.format(enrichedData.capacity),
        // readCertified: EnergyFormatter.format(enrichedData.device.meterStats?.certified ?? 0),
        readCertified: '',
        // readToBeCertified: EnergyFormatter.format(enrichedData.device.meterStats?.uncertified ?? 0),
        readToBeCertified: '',
        status: enrichedData.status,
        gridOperator: enrichedData.gridOperator ?? ''
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
            if (rowData.status === DeviceState.Approved) {
                return {
                    icon: <Assignment />,
                    name: t('device.actions.requestCertificates'),
                    onClick: requestCerts
                };
            }
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
                showModal={showRequestModal}
                setShowModal={setShowRequestModal}
                device={deviceForModal}
            />
        </>
    );
};
