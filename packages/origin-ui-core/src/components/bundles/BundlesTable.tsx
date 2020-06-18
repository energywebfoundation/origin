import React, { useEffect, useState } from 'react';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    usePaginatedLoaderSorting
} from '../Table';
import { useTranslation, formatCurrencyComplete, deviceById, EnergyFormatter, PowerFormatter } from '../../utils';
import { useSelector } from 'react-redux';
import { getProducingDevices } from '../..';
import { Bundle } from '../../utils/exchange';
import BN from 'bn.js';
import { Visibility, Add } from '@material-ui/icons';
import { BundleDetails } from './BundleDetails';
import { getCurrencies, getEnvironment } from '../../features';
import { getBundles } from '../../features/bundles/selectors';
import { Fab, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';

const BUNDLES_PER_PAGE = 25;
const BUNDLES_TOTAL_ENERGY_COLUMN_ID = 'total';
const BUNDLES_TOTAL_ENERGY_PROPERTIES = [
    (record) => Number(record.total.split(EnergyFormatter.displayUnit)[0])
];

export const BundlesTable = () => {
    const bundles = useSelector(getBundles);
    const { t } = useTranslation();
    const devices = useSelector(getProducingDevices);
    const [selectedBundle, setSelectedBundle] = useState<Bundle>(null);
    const [showBundleDetailsModal, setShowBundleDetailsModal] = useState<boolean>(false);
    const environment = useSelector(getEnvironment);

    const energyByType = (bundle: Bundle): TEnergyByType =>
        bundle.items.reduce(
            (grouped, item) => {
                const type = deviceById(item.asset.deviceId, environment, devices)
                    .deviceType.split(';')[0]
                    .toLowerCase();
                (grouped[type] || grouped.other).iadd(item.currentVolume);
                grouped.total.iadd(item.currentVolume);
                return grouped;
            },
            {
                total: new BN(0),
                solar: new BN(0),
                hydro: new BN(0),
                wind: new BN(0),
                other: new BN(0)
            }
        );

    const energyShares = (bundle: Bundle) => {
        const energy = energyByType(bundle);
        return Object.fromEntries(
            Object.keys(energy)
                .filter((p) => p !== 'total')
                .map((p) => [p, energy[p].mul(new BN(10000)).div(energy.total)])
                .map(([p, v]) => {
                    return [p, `${(v.toNumber() / 100).toFixed(2)}%`];
                })
                .concat([['total', EnergyFormatter.format(energy.total.toNumber(), true)]])
        );
    };

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
        const total = bundles.length;
        const paginatedData = bundles.slice(offset, offset + requestedPageSize);
        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize, setPageSize } = usePaginatedLoaderFiltered<
        Bundle
    >({
        getPaginatedData,
        initialPageSize: BUNDLES_PER_PAGE
    });

    useEffect(() => {
        setPageSize(BUNDLES_PER_PAGE);
        loadPage(1);
    }, [bundles]);

    type TEnergyByType = {
        total: BN;
        solar: BN;
        wind: BN;
        hydro: BN;
        other: BN;
    };

    const [currency = 'USD'] = useSelector(getCurrencies);

    const rows = paginatedData.map((bundle) => {
        return {
            ...energyShares(bundle),
            price: ` ${formatCurrencyComplete(bundle.price / 100, currency)}`
        };
    });
    sortData(rows);

    const viewDetails = (rowIndex) => {
        const bundle = paginatedData[rowIndex];
        setSelectedBundle(bundle);
        setShowBundleDetailsModal(true);
    };

    const columns = [
        {
            id: BUNDLES_TOTAL_ENERGY_COLUMN_ID,
            label: t('bundle.properties.total_energy'),
            sortProperties: BUNDLES_TOTAL_ENERGY_PROPERTIES
        },
        { id: 'solar', label: t('bundle.properties.solar') },
        { id: 'wind', label: t('bundle.properties.wind') },
        { id: 'hydro', label: t('bundle.properties.hydro') },
        { id: 'other', label: t('bundle.properties.other') },
        {
            id: 'price',
            label: t('bundle.properties.price'),
            sortProperties: [(bundle: Bundle) => bundle.price]
        }
    ];

    const actions = [
        {
            icon: <Visibility />,
            name: 'View details',
            onClick: (row: string) => viewDetails(parseInt(row, 10))
        }
    ];

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
            <BundleDetails bundle={selectedBundle} showModal={showBundleDetailsModal} />
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
