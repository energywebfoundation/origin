import { IDevice } from '@energyweb/origin-backend-core';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField
} from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getOffChainDataSource } from '../features/general/selectors';
import { getUserOffchain } from '../features/users/selectors';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { NotificationType, showNotification } from '../utils/notifications';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    TableMaterial,
    usePaginatedLoaderFiltered
} from './Table';
import { CustomFilterInputType, ICustomFilterDefinition } from './Table/FiltersHeader';
import { moment } from '../utils';

interface IRecord {
    device: IDevice;
}

export const KeyStatus = {
    1: 'Active',
    2: 'Paused'
};

export function AutoSupplyDeviceTable() {
    const deviceClient = useSelector(getOffChainDataSource)?.deviceClient;
    const userOffchain = useSelector(getUserOffchain);

    const [showModal, setShowModal] = useState<boolean>(null);
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
            entities = await deviceClient.getSupplyBy(
                requestedFilters[0]?.selectedValue,
                parseInt(requestedFilters[1]?.selectedValue, 10) || 0
            );
        } else {
            entities = await deviceClient.getMyDevice();
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

    const currentYear = moment(new Date().valueOf());
    const nextYear = moment(currentYear).add(1, 'years');

    const columns = [
        { id: 'type', label: 'Type' },
        { id: 'facility', label: 'Facility' },
        { id: 'price', label: 'Price' },
        { id: 'status', label: 'Status' },
        {
            id: 'certified',
            label: `To be certified for ${currentYear.format('YYYY')}/${nextYear.format(
                'YYYY'
            )} (Mwh)`
        }
    ] as const;

    const rows = paginatedData.map(({ device }) => {
        return {
            type: device.deviceType?.replace(new RegExp(';', 'g'), '-') ?? '-',
            facility: device.facilityName,
            price: device.defaultAskPrice / 100,
            status: device.automaticPostForSale ? KeyStatus[1] : KeyStatus[2],
            certified: EnergyFormatter.format(device.meterStats?.uncertified?.toNumber() ?? 0)
        };
    });

    const actions = [
        {
            icon: <Delete />,
            name: 'Delete',
            onClick: async (index: string) => {
                const { device } = paginatedData[index];
                await deviceClient.delete(device.id);
                loadPage(1);
            }
        },
        {
            icon: <Edit />,
            name: 'Update',
            onClick: (index: string) => {
                const { device } = paginatedData[index];
                setEntity({ ...device, defaultAskPrice: device.defaultAskPrice / 100 });
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

    function hideModal() {
        setShowModal(false);
    }

    async function reqAutoSupply() {
        try {
            await deviceClient.updateDeviceSettings(entity.id, {
                automaticPostForSale: entity.automaticPostForSale,
                defaultAskPrice: entity.defaultAskPrice * 100
            });
            hideModal();
            loadPage(1);
            showNotification('Supply updated.', NotificationType.Success);
        } catch (error) {
            showNotification('Error to update Supply', NotificationType.Error);
        }
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
            <Dialog open={showModal}>
                <DialogTitle>{'Update Supply'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={'Type'}
                        value={entity?.deviceType}
                        className="mt-4"
                        disabled={true}
                        fullWidth
                    />

                    <TextField
                        label={'Facility'}
                        value={entity?.facilityName}
                        className="mt-4"
                        disabled={true}
                        fullWidth
                    />

                    <TextField
                        label={'Price'}
                        value={entity?.defaultAskPrice}
                        className="mt-4"
                        type="number"
                        inputProps={{ step: 0.01 }}
                        onChange={(e) =>
                            setEntity({
                                ...entity,
                                defaultAskPrice:
                                    parseFloat(parseFloat(e.target.value).toFixed(2)) ?? 0.0
                            })
                        }
                        fullWidth
                    />

                    <TextField
                        label={'Status'}
                        value={entity?.automaticPostForSale ? KeyStatus[1] : KeyStatus[2]}
                        className="mt-4"
                        fullWidth
                        onChange={(e) =>
                            setEntity({
                                ...entity,
                                automaticPostForSale: e.target.value !== 'Paused'
                            })
                        }
                        select
                    >
                        <MenuItem value={'Active'}>Active</MenuItem>
                        <MenuItem value={'Paused'}>Paused</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={hideModal} color="secondary">
                        {'cancel'}
                    </Button>
                    <Button onClick={reqAutoSupply} color="primary">
                        {'update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
