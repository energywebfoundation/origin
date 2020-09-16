import React, { useEffect } from 'react';
import { Role, isRole, UserStatus } from '@energyweb/origin-backend-core';
import { useSelector, useDispatch } from 'react-redux';
import { getProducingDevices, getConfiguration } from '../../features/selectors';
import { TableMaterial } from '../Table/TableMaterial';
import { Check } from '@material-ui/icons';
import { getUserOffchain } from '../../features/users/selectors';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table/PaginatedLoaderHooks';
import { ProducingDevice } from '@energyweb/device-registry';
import {
    EnergyFormatter,
    PowerFormatter,
    getDeviceLocationText,
    getDeviceGridOperatorText,
    getDeviceColumns,
    useTranslation,
    showNotification,
    NotificationType
} from '../../utils';
import { Skeleton } from '@material-ui/lab';
import { getOffChainDataSource, getEnvironment } from '../../features/general/selectors';
import { CertificationRequest } from '@energyweb/issuer';
import { requestCertificateApproval } from '../../features/certificates';

interface IProps {
    approved: boolean;
}

interface IRecord {
    request: CertificationRequest;
    device: ProducingDevice.Entity;
}

export function CertificationRequestsTable(props: IProps) {
    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const producingDevices = useSelector(getProducingDevices);
    const offChainDataSource = useSelector(getOffChainDataSource);
    const environment = useSelector(getEnvironment);
    const { t } = useTranslation();

    const dispatch = useDispatch();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!user || !offChainDataSource || producingDevices.length === 0) {
            return {
                paginatedData: [],
                total: 0
            };
        }
        let newPaginatedData: IRecord[] = [];
        const isIssuer = isRole(user, Role.Issuer);
        try {
            const requests = await CertificationRequest.getAll(configuration);

            for (const request of requests) {
                const requestDevice = producingDevices.find(
                    // eslint-disable-next-line no-loop-func
                    (device) => device.id?.toString() === request.deviceId
                );

                if (
                    request.approved !== props.approved ||
                    (!isIssuer && user?.organization.id !== requestDevice?.organization)
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
                    `Only active users can perform this action. Your status is ${
                        UserStatus[user.status]
                    }`,
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

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoader<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [props.approved, user, producingDevices.length, configuration]);

    async function approve(rowIndex: number) {
        const certificationRequest = paginatedData[rowIndex].request;

        dispatch(
            requestCertificateApproval({
                certificationRequest,
                callback: () => {
                    loadPage(1);
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
            facility: device?.facilityName,
            gridOperator: getDeviceGridOperatorText(device),
            deviceLocation: getDeviceLocationText(device),
            type: configuration.deviceTypeService.getDisplayText(device?.deviceType),
            capacity: PowerFormatter.format(device?.capacityInW),
            meterRead: EnergyFormatter.format(request.energy),
            files: request.files.map((f) => (
                <div key={f}>
                    <a
                        href={offChainDataSource.filesClient.getLink(f)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {f}
                    </a>
                </div>
            ))
        };
    });

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
