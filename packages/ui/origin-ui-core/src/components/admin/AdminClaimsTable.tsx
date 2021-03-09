import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllDevices,
    getAllDevices,
    getBackendClient,
    getCertificatesClient,
    getEnvironment
} from '../../features';
import { TableMaterial } from '../Table';

interface IRow {
    id: number;
    device: string;
    energy: string;
    beneficiary: string;
}

export function AdminClaimsTable(): JSX.Element {
    const [rows, setRows] = useState([]);
    const certificatesClient = useSelector(getCertificatesClient);
    const backendClient = useSelector(getBackendClient);
    const deviceClient = backendClient?.deviceClient;
    const dispatch = useDispatch();
    const environment = useSelector(getEnvironment);

    const allDevices = useSelector(getAllDevices);

    async function update() {
        const { data: certs } = await certificatesClient.getAll();

        if (certs) {
            setRows(
                certs.map((c) => {
                    const certDevice = allDevices.find((device) =>
                        device.externalDeviceIds.some(
                            (deviceExternalId) =>
                                deviceExternalId.id === c.deviceId &&
                                deviceExternalId.type === environment.ISSUER_ID
                        )
                    );

                    return {
                        id: c.id,
                        device: certDevice.facilityName,
                        energy: c.energy.publicVolume,
                        beneficiary: certDevice.organizationName
                    } as IRow;
                })
            );
        }
    }

    useEffect(() => {
        update();
    }, [allDevices]);

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchAllDevices());
        }
    }, [deviceClient]);

    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'device', label: 'Device' },
        { id: 'energy', label: 'Energy' },
        { id: 'beneficiary', label: 'Beneficiary' }
    ];

    return (
        <TableMaterial columns={columns} rows={rows} total={rows.length} pageSize={rows.length} />
    );
}
