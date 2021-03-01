import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@material-ui/lab';
import { Check } from '@material-ui/icons';
import { Role, isRole } from '@energyweb/origin-backend-core';
import { CertificationRequestStatus } from '@energyweb/issuer-api-client';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader,
    TableFallback,
    getCertificationRequestsClient,
    ICertificationRequest,
    requestCertificateApproval,
    getConfiguration,
    getUserOffchain,
    EnergyFormatter,
    PowerFormatter,
    showNotification,
    NotificationType,
    downloadFile,
    getBackendClient
} from '@energyweb/origin-ui-core';
import { getEnvironment, getDeviceClient } from '../../../features/general';
import { getAllDevices, fetchPublicDevices } from '../../../features/devices';
import {
    getDeviceLocationText,
    getDeviceColumns,
    getDeviceGridOperatorText
} from '../../../utils/device';
import { ComposedPublicDevice } from '../../../types';

interface IProps {
    approved: boolean;
}

interface IRecord {
    request: ICertificationRequest;
    device: ComposedPublicDevice;
}

export function CertificationRequestsTable(props: IProps) {
    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const allDevices = useSelector(getAllDevices);
    const deviceClient = useSelector(getDeviceClient);
    const backendClient = useSelector(getBackendClient);
    const environment = useSelector(getEnvironment);
    const dispatch = useDispatch();

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchPublicDevices());
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
                    request.approved !== props.approved ||
                    request.status !== CertificationRequestStatus.Executed ||
                    (!isIssuer && user?.organization?.id !== Number(requestDevice?.ownerId))
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

    const actions =
        isRole(user, Role.Issuer) && !props.approved
            ? [
                  {
                      icon: <Check />,
                      name: 'Approve',
                      onClick: (row: string) => approve(parseInt(row, 10))
                  }
              ]
            : [];

    const columns = [
        { id: 'facility', label: 'Facility' },
        ...getDeviceColumns(environment, t),
        { id: 'type', label: 'Type' },
        { id: 'capacity', label: `Capacity (${PowerFormatter.displayUnit})` },
        { id: 'meterRead', label: `Meter Read (${EnergyFormatter.displayUnit})` },
        { id: 'files', label: 'Evidence files' }
    ] as const;

    const rows = paginatedData.map(({ device, request }) => {
        return {
            facility: device?.name,
            gridOperator: getDeviceGridOperatorText(device),
            deviceLocation: getDeviceLocationText(device),
            type: configuration.deviceTypeService.getDisplayText(device?.deviceType),
            capacity: PowerFormatter.format(device?.capacity),
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
            ))
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
