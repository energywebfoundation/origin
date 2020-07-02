import React, { useEffect, useState } from 'react';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    usePaginatedLoaderSorting
} from '../Table';
import {
    useTranslation,
    formatCurrencyComplete,
    EnergyFormatter,
    energyShares,
    getProducingDevices
} from '../..';
import { EnergyTypes } from '../../utils';
import { useSelector, useDispatch } from 'react-redux';

import { Bundle, Order } from '../../utils/exchange';
import { Visibility, Add, Cancel as CancelIcon } from '@material-ui/icons';
import BundleDetails from './BundleDetails';
import { getCurrencies, getEnvironment } from '../../features';
import { getBundles, getShowBundleDetails } from '../../features/bundles/selectors';
import { Fab, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { showBundleDetails, cancelBundle } from '../../features/bundles';
import { getOrders } from '../../features/orders/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { OrderSide } from '../../../../exchange-core/src';

const BUNDLES_PER_PAGE = 25;
const BUNDLES_TOTAL_ENERGY_COLUMN_ID = 'total';
const BUNDLES_TOTAL_ENERGY_PROPERTIES = [
    (record) => Number(record.total.split(EnergyFormatter.displayUnit)[0].replace(',', ''))
];

const ENERGY_COLUMNS_TO_DISPLAY = [EnergyTypes.SOLAR, EnergyTypes.WIND, EnergyTypes.HYDRO];

export const MyOrdersTable = () => {
    const userId = useSelector(getUserOffchain).id;
    const orders: Order[] = useSelector(getOrders).filter((o) => o.userId === userId.toString());
    const asks = orders.filter((o) => o.side === OrderSide.Ask);
    const bids = orders.filter((o) => o.side === OrderSide.Bid);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const columns = [
        { id: 'volume', label: t('order.properties.volume') },
        { id: 'price', label: t('order.properties.price') },
        { id: 'device_type', label: t('order.properties.device_type') },
        { id: 'generation_start', label: t('order.properties.generation_start') },
        { id: 'generation_end', label: t('order.properties.generation_end') },
        { id: 'filled', label: t('bundle.properties.filled') }
    ];

    const { currentSort, sortAscending, sortData, toggleSort } = usePaginatedLoaderSorting({
        currentSort: {
            id: BUNDLES_TOTAL_ENERGY_COLUMN_ID,
            sortProperties: BUNDLES_TOTAL_ENERGY_PROPERTIES
        },
        sortAscending: false
    });

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const total = orders.length;
        const paginatedData = orders.slice(offset, offset + requestedPageSize);
        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize, setPageSize } = usePaginatedLoaderFiltered<
        Bundle
    >({
        getPaginatedData,
        initialPageSize: ORDERS_PER_PAGE
    });

    useEffect(() => {
        setPageSize(BUNDLES_PER_PAGE);
        loadPage(1);
    }, [allBundles, owner]);

    const [currency = 'USD'] = useSelector(getCurrencies);

    const rows = paginatedData.map((bundle) => {
        return {
            ...energyShares(bundle, environment, devices, ENERGY_COLUMNS_TO_DISPLAY),
            price: ` ${formatCurrencyComplete(bundle.price / 100, currency)}`,
            bundleId: bundle.id
        };
    });
    sortData(rows);

    const viewDetails = (rowIndex: number) => {
        const { bundleId } = rows[rowIndex];
        const bundle = bundles.find((b) => b.id === bundleId);
        setSelected(bundle);
        dispatch(showBundleDetails(true));
    };

    const removeBundle = (rowIndex: number) => {
        const { bundleId } = rows[rowIndex];
        dispatch(cancelBundle(bundleId));
    };

    const actions = [
        {
            icon: <Visibility />,
            name: 'View details',
            onClick: (row: string) => viewDetails(parseInt(row, 10))
        }
    ];

    if (owner) {
        actions.push({
            icon: <CancelIcon />,
            name: 'Remove bundle',
            onClick: (row: string) => removeBundle(parseInt(row, 10))
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
                actions={actions}
                currentSort={currentSort}
                sortAscending={sortAscending}
                toggleSort={toggleSort}
                handleRowClick={(rowIndex: string) => viewDetails(parseInt(rowIndex, 10))}
            />
            {isBundleDetailsVisible && <BundleDetails bundle={selected} owner={owner} />}
            <Link to={'/certificates/create_bundle'}>
                <Tooltip title={t('certificate.actions.create_bundle')}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        style={{ position: 'relative', marginTop: '20px', float: 'right' }}
                    >
                        <Add />
                    </Fab>
                </Tooltip>
            </Link>
        </>
    );
};
