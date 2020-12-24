/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BigNumber } from 'ethers';
import { Edit } from '@material-ui/icons';
import { text } from '@storybook/addon-knobs';
import { IDevice } from '@energyweb/origin-backend-core';
import { getBackendClient } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import {
    BackendClient,
    formatCurrencyComplete,
    moment,
    useDevicePermissions,
    useTranslation
} from '../../utils';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    TableMaterial,
    usePaginatedLoaderFiltered
} from '../Table';
import { CustomFilterInputType, ICustomFilterDefinition } from '../Table/FiltersHeader';
import { UpdateSupplyModal } from '../Modal/UpdateSupplyModal';
import { Requirements } from '@energyweb/origin-ui-core/src/components/Requirements';

interface IRecord {
    device: IDevice;
}

export const KeyStatus = {
    1: 'Active',
    2: 'Paused'
};

export function AutoSupplyDeviceTable() {
    const backendClient: BackendClient = useSelector(getBackendClient);
    const deviceClient = backendClient?.deviceClient;
    const userOffchain = useSelector(getUserOffchain);
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState<boolean>(false);
    const [entity, setEntity] = useState<IDevice>(null);

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!deviceClient) {
            return {
                paginatedData: [],
                total: 0
            };
        }
        let entities = [];
        if (requestedFilters.length > 0) {
            const response = await deviceClient.getSupplyBy(
                requestedFilters[0]?.selectedValue,
                requestedFilters[1]?.selectedValue || '0'
            );
            entities = response.data;
        } else {
            const { data: myDevices } = await deviceClient.getMyDevices(false);

            entities = myDevices;
        }
        let newPaginatedData: IRecord[] = entities.map((i) => ({
            device: i
        }));

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);
        const newTotal = newPaginatedData.length;

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        setShowModal(false);
        loadPage(1);
    }, [userOffchain, deviceClient]);

    const currentYear = moment().format('YYYY');
    const nextYear = moment().add(1, 'years').format('YYYY');

    const columns = [
        { id: 'type', label: t('device.properties.type') },
        { id: 'facility', label: t('device.properties.facilityName') },
        { id: 'price', label: t('device.properties.price') },
        { id: 'status', label: t('device.properties.status') },
        {
            id: 'certified',
            label: `${t(
                'device.properties.meterReadToBeCertified'
            )} for ${currentYear}/${nextYear} (${EnergyFormatter.displayUnit})`
        }
    ] as const;

    const rows = paginatedData.map(({ device }) => {
        return {
            type: device.deviceType?.replace(new RegExp(';', 'g'), ' - ') ?? '-',
            facility: device.facilityName,
            price: formatCurrencyComplete(device.defaultAskPrice / 100, text('currency', 'USD')),
            status: device.automaticPostForSale ? KeyStatus[1] : KeyStatus[2],
            certified: EnergyFormatter.format(
                BigNumber.from(device.meterStats?.uncertified ?? 0).toNumber()
            )
        };
    });

    const actions = [
        {
            icon: <Edit />,
            name: 'Update',
            onClick: (index: string) => {
                const { device } = paginatedData[index];

                setEntity({
                    ...device,
                    deviceType: device.deviceType?.replace(new RegExp(';', 'g'), ' - ') ?? '-',
                    defaultAskPrice: device.defaultAskPrice / 100
                });
                setShowModal(true);
            }
        }
    ];

    const STATUS_OPTIONS = Object.keys(KeyStatus).map((key) => ({
        value: key.toString(),
        label: KeyStatus[key]
    }));

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IDevice) => `${record.facilityName}`,
            label: 'Facility',
            input: {
                type: CustomFilterInputType.string
            }
        },
        {
            property: (record: IDevice) => `${record.status}`,
            label: 'Status',
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: STATUS_OPTIONS
            }
        }
    ];

    const { canCreateDevice } = useDevicePermissions();

    if (!canCreateDevice?.value) {
        return <Requirements />;
    }

    return (
        <>
            <TableMaterial
                columns={columns}
                rows={rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                actions={actions}
                filters={filters}
            />
            <UpdateSupplyModal
                showModal={showModal}
                setShowModal={setShowModal}
                entity={entity}
                setEntity={setEntity}
                loadPage={loadPage}
            />
        </>
    );
}
