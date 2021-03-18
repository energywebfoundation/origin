import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Role, isRole } from '@energyweb/origin-backend-core';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader,
    TableFallback
} from '../../Table';
import { Skeleton } from '@material-ui/lab';
import { Check } from '@material-ui/icons';
import { CertificationRequestStatus } from '@energyweb/issuer-api-client';

import {
    getConfiguration,
    getAllDevices,
    fetchAllDevices,
    getUserOffchain,
    getBackendClient,
    getEnvironment,
    getCertificationRequestsClient,
    ICertificationRequest,
    requestCertificateApproval
} from '../../../features';
import {
    getDeviceLocationText,
    getDeviceGridOperatorText,
    getDeviceColumns,
    EnergyFormatter,
    PowerFormatter,
    showNotification,
    NotificationType,
    formatDate
} from '../../../utils';
import { downloadFile } from '../../Documents';
import { IOriginDevice } from '../../../types';

interface IProps {
    approved?: boolean;
}

interface IRecord {
    request: ICertificationRequest;
    device: IOriginDevice;
}

interface IRowData {
    approved: boolean;
    files: JSX.Element[];
    gridOperator: string;
    type: string;
    meterRead: string;
    facility: string;
    deviceLocation: string;
    capacity: string;
    status: string;
    timeFrame: JSX.Element;
}
type Rows = IRowData[];

export function CertificationRequestsTable(props: IProps): JSX.Element {
    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const allDevices = useSelector(getAllDevices);
    const backendClient = useSelector(getBackendClient);
    const deviceClient = backendClient?.deviceClient;
    const environment = useSelector(getEnvironment);
    const dispatch = useDispatch();

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchAllDevices());
        }
    }, [deviceClient]);

    const certificationRequestsClient = useSelector(getCertificationRequestsClient);

    const { t } = useTranslation();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!user || !backendClient || allDevices.length === 0) {
            return {
                paginatedData: [],
                total: 0
            };
        }
        let newPaginatedData: IRecord[] = [];
        const isIssuer = isRole(user, Role.Issuer);

        try {
            const { data: requests } = await certificationRequestsClient.getAll();

            for (const request of requests) {
                const requestDevice = allDevices.find(
                    // eslint-disable-next-line no-loop-func
                    (device) =>
                        device.externalDeviceIds.some(
                            (deviceExternalId) =>
                                deviceExternalId.id === request.deviceId &&
                                deviceExternalId.type === environment.ISSUER_ID
                        )
                );

                if (
                    (props.approved !== undefined && request.approved !== props.approved) ||
                    request.status !== CertificationRequestStatus.Executed ||
                    (!isIssuer && user?.organization?.id !== requestDevice?.organizationId)
                ) {
                    continue;
                }

                newPaginatedData.push({
                    request,
                    device: requestDevice
                });
            }
        } catch (error) {
            const _error = { ...error };
            if (_error.response.status === 412) {
                showNotification(
                    `Only active users can perform this action. Your status is ${user.status}`,
                    NotificationType.Error
                );
            }
        }

        const newTotal = newPaginatedData.length;

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize, removeItem } = usePaginatedLoader<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        if (allDevices !== null) {
            loadPage(1);
        }
    }, [props.approved, user, allDevices, configuration]);

    async function approve(rowIndex: number) {
        const certificationRequest = paginatedData[rowIndex].request;

        dispatch(
            requestCertificateApproval({
                certificationRequestId: certificationRequest.id,
                callback: () => {
                    removeItem(rowIndex);
                }
            })
        );
    }

    if (!configuration) {
        return <Skeleton variant="rect" height={200} />;
    }

    const actions = [
        (rowData: IRowData) =>
            isRole(user, Role.Issuer) && !rowData.approved
                ? {
                      icon: <Check />,
                      name: 'Approve',
                      onClick: (row: string) => approve(parseInt(row, 10))
                  }
                : null
    ];

    const columns = [
        { id: 'facility', label: 'Facility' },
        ...getDeviceColumns(environment, t),
        { id: 'type', label: 'Type' },
        { id: 'capacity', label: `Capacity (${PowerFormatter.displayUnit})` },
        { id: 'meterRead', label: `Meter Read (${EnergyFormatter.displayUnit})` },
        { id: 'files', label: 'Evidence files' },
        { id: 'timeFrame', label: 'Request Date' },
        { id: 'status', label: 'Status' }
    ] as const;

    const rows: Rows = paginatedData.map(({ device, request }) => {
        return {
            // deepscan-disable-next-line INSUFFICIENT_NULL_CHECK
            facility: device?.facilityName,
            gridOperator: getDeviceGridOperatorText(device),
            deviceLocation: getDeviceLocationText(device),
            // deepscan-disable-next-line INSUFFICIENT_NULL_CHECK
            type: configuration.deviceTypeService.getDisplayText(device?.deviceType),
            // deepscan-disable-next-line INSUFFICIENT_NULL_CHECK
            capacity: PowerFormatter.format(device?.capacityInW),
            meterRead: EnergyFormatter.format(request.energy),
            files: request.files.map((fileId) => (
                <div key={fileId}>
                    <a
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => downloadFile(backendClient?.fileClient, fileId, fileId)}
                    >
                        {fileId}
                    </a>
                </div>
            )),
            timeFrame: (
                <div style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(request.fromTime * 1000)} - {formatDate(request.toTime * 1000)}
                </div>
            ),
            approved: request.approved,
            status: request.approved ? 'Approved' : 'Pending'
        };
    });

    if (allDevices === null) {
        return <TableFallback />;
    }

    return (
        <TableMaterial
            columns={columns}
            rows={rows}
            loadPage={loadPage}
            total={total}
            pageSize={pageSize}
            actions={actions}
        />
    );
}
