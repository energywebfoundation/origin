import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BigNumber } from 'ethers';
import { Edit, Remove } from '@material-ui/icons';
import {
    getBackendClient,
    formatCurrencyComplete,
    moment,
    usePermissions,
    useTranslation,
    EnergyFormatter,
    IPaginatedLoaderHooksFetchDataParameters,
    TableMaterial,
    usePaginatedLoaderFiltered,
    CustomFilterInputType,
    ICustomFilterDefinition,
    Requirements,
    TableFallback,
    checkRecordPassesFilters,
    getCurrencies
} from '@energyweb/origin-ui-core';
import { UpdateSupplyModal, RemoveSupplyConfirmation } from '../components/modal';
import { getEnvironment } from '../features/general';
import { IDeviceWithSupply, ISupplyTableRecord } from '../types';
import { getSupplies, fetchSupplies } from '../features/supply';

export const KeyStatus = {
    Active: 'Active',
    Paused: 'Paused'
};

export function SupplyTable() {
    const backendClient = useSelector(getBackendClient);
    const deviceClient = backendClient?.deviceClient;

    const { t } = useTranslation();
    const currencies = useSelector(getCurrencies);
    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';
    const environment = useSelector(getEnvironment);
    const issuerId = environment?.ISSUER_ID;
    const dispatch = useDispatch();

    const [showUpdateModal, setShowModal] = useState<boolean>(false);
    const [entity, setEntity] = useState<IDeviceWithSupply>(null);
    const [supplyToRemove, setToRemove] = useState<IDeviceWithSupply>();
    const supplySettings = useSelector(getSupplies);

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

        let entities: IDeviceWithSupply[] = [];

        const { data: myDevices } = await deviceClient.getMyDevices(false);
        const devicesEnrichedWithSupply = myDevices.map((device) => {
            const matchingSupply = supplySettings?.find(
                (supply) =>
                    supply.deviceId ===
                    device.externalDeviceIds.find((external) => external.type === issuerId).id
            );
            if (matchingSupply) {
                return {
                    ...device,
                    active: matchingSupply.active,
                    price: matchingSupply.price,
                    supplyId: matchingSupply.id,
                    supplyCreated: true
                };
            } else {
                return { ...device, supplyCreated: false };
            }
        });
        entities = devicesEnrichedWithSupply;

        const filteredEntities = entities.filter((device) => {
            return checkRecordPassesFilters(device, requestedFilters);
        });

        let newPaginatedData: ISupplyTableRecord[] = filteredEntities.map((i) => ({
            device: i
        }));

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);
        const newTotal = newPaginatedData.length;

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<
        ISupplyTableRecord
    >({
        getPaginatedData
    });

    useEffect(() => {
        if (deviceClient) {
            loadPage(1);
        }
    }, [deviceClient, supplySettings]);

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchSupplies());
        }
    }, [deviceClient]);

    const currentYear = moment().format('YYYY');
    const nextYear = moment().add(1, 'years').format('YYYY');

    const columns = [
        { id: 'type', label: t('exchange.supply.type') },
        { id: 'facility', label: t('exchange.supply.facilityName') },
        { id: 'price', label: t('exchange.supply.price') },
        { id: 'status', label: t('exchange.supply.status') },
        {
            id: 'certified',
            label: `${t(
                'exchange.supply.meterReadToBeCertified'
            )} for ${currentYear}/${nextYear} (${EnergyFormatter.displayUnit})`
        }
    ] as const;

    const rows = paginatedData.map(({ device }) => {
        return {
            type: device.deviceType?.replace(new RegExp(';', 'g'), ' - ') ?? '-',
            facility: device.facilityName,
            price: formatCurrencyComplete(device.price || 0 / 100, defaultCurrency),
            status: device.active ? KeyStatus.Active : KeyStatus.Paused,
            certified: EnergyFormatter.format(
                BigNumber.from(device.meterStats?.uncertified ?? 0).toNumber()
            )
        };
    });

    const editSupply = (index: string) => {
        const { device } = paginatedData[index];
        setEntity({
            ...device,
            deviceType: device.deviceType?.replace(new RegExp(';', 'g'), ' - ') ?? '-',
            defaultAskPrice: device.defaultAskPrice / 100
        });
        setShowModal(true);
    };

    const removeSupply = (index: string) => {
        const { device } = paginatedData[index];
        setToRemove(device);
    };

    const actions = [
        {
            icon: <Edit />,
            name: t('exchange.supply.update'),
            onClick: (idx: string) => editSupply(idx)
        },
        {
            icon: <Remove />,
            name: t('exchange.supply.remove'),
            onClick: (idx: string) => removeSupply(idx)
        }
    ];

    const STATUS_OPTIONS = Object.keys(KeyStatus).map((key) => ({
        value: KeyStatus[key],
        label: key.toString()
    }));

    const filters: ICustomFilterDefinition[] = [
        {
            property: (device: IDeviceWithSupply) => device.facilityName.toString(),
            label: t('exchange.supply.facility'),
            input: {
                type: CustomFilterInputType.string
            }
        },
        {
            property: (device: IDeviceWithSupply) =>
                device.active ? KeyStatus.Active : KeyStatus.Paused,
            label: t('exchange.supply.status'),
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: STATUS_OPTIONS
            }
        }
    ];

    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }
    if (supplySettings === null) {
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
                actions={actions}
                filters={filters}
            />
            <UpdateSupplyModal
                showModal={showUpdateModal}
                setShowModal={setShowModal}
                entity={entity}
                setEntity={setEntity}
            />
            {supplyToRemove && (
                <RemoveSupplyConfirmation device={supplyToRemove} close={() => setToRemove(null)} />
            )}
        </>
    );
}
