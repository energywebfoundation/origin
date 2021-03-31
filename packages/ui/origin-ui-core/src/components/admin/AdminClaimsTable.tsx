import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CertificateDTO } from '@energyweb/issuer-api-client';
import {
    fetchAllDevices,
    fromGeneralSelectors,
    getAllDevices,
    getCertificatesClient
} from '../../features';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    TableFallback,
    TableMaterial,
    usePaginatedLoader
} from '../Table';
import { NotificationTypeEnum, showNotification } from '../../utils';
import { EnergyFormatter, formatDate, getDeviceName } from '../../utils';
import { useTranslation } from 'react-i18next';

type Record = {
    certificateId: string;
    deviceName: string;
    energy: string;
    beneficiary: string;
    fromDate: string;
    toDate: string;
};

type DeviceNamesMap = Map<string, string>;

export function AdminClaimsTable(): JSX.Element {
    const certificatesClient = useSelector(getCertificatesClient);
    const backendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const deviceClient = backendClient?.deviceClient;
    const environment = useSelector(fromGeneralSelectors.getEnvironment);
    const allDevices = useSelector(getAllDevices);
    const { t } = useTranslation();
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
                        beneficiary: claim.claimData.beneficiary,
                        fromDate: formatDate(claim.claimData.fromDate),
                        toDate: formatDate(claim.claimData.toDate)
                    });
                });
            });
        } catch (error) {
            showNotification('Error while getting certificates', NotificationTypeEnum.Error);
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
        { id: 'certificateId', label: t('certificate.claims.certificateId') },
        { id: 'deviceName', label: t('certificate.claims.deviceName') },
        { id: 'energy', label: t('certificate.claims.energy') },
        { id: 'beneficiary', label: t('certificate.claims.beneficiary') },
        { id: 'fromDate', label: t('certificate.claims.fromDate') },
        { id: 'toDate', label: t('certificate.claims.toDate') }
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
