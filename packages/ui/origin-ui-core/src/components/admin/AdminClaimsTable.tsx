import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CertificateDTO } from '@energyweb/issuer-api-client';
import {
    fetchAllDevices,
    getAllDevices,
    getBackendClient,
    getCertificatesClient,
    getEnvironment
} from '../../features';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    TableFallback,
    TableMaterial,
    usePaginatedLoader
} from '../Table';
import { NotificationType, showNotification } from '../../utils/notifications';
import { EnergyFormatter, getDeviceName } from '../../utils';

type Record = {
    certificateId: string;
    deviceName: string;
    energy: string;
    beneficiary: string;
};

type DeviceNamesMap = Map<string, string>;

export function AdminClaimsTable(): JSX.Element {
    const certificatesClient = useSelector(getCertificatesClient);
    const backendClient = useSelector(getBackendClient);
    const deviceClient = backendClient?.deviceClient;
    const environment = useSelector(getEnvironment);
    const allDevices = useSelector(getAllDevices);
    const dispatch = useDispatch();

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchAllDevices());
        }
    }, [deviceClient]);

    const returnAndStoreDeviceName = (
        deviceName: string,
        deviceId: string,
        deviceMap: DeviceNamesMap
    ) => {
        deviceMap.set(deviceId, deviceName);
        return deviceName;
    };

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!deviceClient || allDevices.length === 0) {
            return {
                paginatedData: [],
                total: 0
            };
        }

        const newPaginatedData: Record[] = [];

        try {
            const {
                data: certificates
            }: { data: CertificateDTO[] } = await certificatesClient.getAll();

            const deviceNames: DeviceNamesMap = new Map<string, string>();

            certificates.forEach((certificate) => {
                certificate.claims.forEach((claim) => {
                    newPaginatedData.push({
                        certificateId: claim.id.toString(),
                        deviceName:
                            deviceNames.get(certificate.deviceId) ??
                            returnAndStoreDeviceName(
                                getDeviceName(certificate.deviceId, allDevices, environment),
                                certificate.deviceId,
                                deviceNames
                            ),
                        energy: EnergyFormatter.format(claim.value, true),
                        beneficiary: claim.claimData.beneficiary
                    });
                });
            });
        } catch (error) {
            showNotification('Error while getting certificates', NotificationType.Error);
        }

        const newTotal = newPaginatedData.length;

        const slicedPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: slicedPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoader<Record>({
        getPaginatedData
    });

    useEffect(() => {
        if (allDevices !== null && certificatesClient) {
            loadPage(1);
        }
    }, [allDevices, certificatesClient]);

    const columns = [
        { id: 'certificateId', label: 'Certificate id' },
        { id: 'deviceName', label: 'Device name' },
        { id: 'energy', label: 'Energy' },
        { id: 'beneficiary', label: 'Beneficiary' }
    ];
    const rows: Record[] = paginatedData;

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
        />
    );
}
