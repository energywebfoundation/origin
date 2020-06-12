import React, { useEffect, useState } from 'react';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    usePaginatedLoaderSorting
} from '../Table';
import { useTranslation, formatCurrencyComplete } from '../../utils';
import { useSelector } from 'react-redux';
import { getExchangeClient, getConfiguration, getProducingDevices } from '../..';
import { Bundle } from '../../utils/exchange';
import { getUserOffchain } from '../../features/users/selectors';
import BN from 'bn.js';
import { Visibility } from '@material-ui/icons';
import { BundleDetails } from './BundleDetails';
import { getCurrencies } from '../../features';

const BUNDLES_PER_PAGE = 25;
const BUNDLES_TOTAL_ENERGY_COLUMN_ID = 'total';
const BUNDLES_TOTAL_ENERGY_PROPERTIES = [
    (record: Bundle) =>
        record.items.reduce((total, item) => total.add(item.currentVolume), new BN(0)).toNumber()
];

export const BundlesTable = () => {
    const { t } = useTranslation();
    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const devices = useSelector(getProducingDevices);
    const [selectedBundle, setSelectedBundle] = useState<Bundle>(null);
    const [showBundleDetailsModal, setShowBundleDetailsModal] = useState<boolean>(false);
    const exchangeClient = useSelector(getExchangeClient);

    const energyByType = (bundle: Bundle): TEnergyByType =>
        bundle.items.reduce(
            (grouped, item) => {
                const type = devices
                    .find((device) => device.id === Number(item.asset.deviceId))
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
                .filter((p) => p === 'total')
                .map((p) => [p, energy[p].div(energy.total)])
                .map(([p, v]) => [p, `${Number(v).toFixed(2)} %`])
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
        const availableBundles: Bundle[] = await exchangeClient.getAvailableBundles();
        const total = availableBundles.length;
        const paginatedData = availableBundles.slice(offset, offset + requestedPageSize);
        sortData(paginatedData);
        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize, setPageSize } = usePaginatedLoaderFiltered<
        Bundle
    >({
        getPaginatedData
    });

    useEffect(() => {
        setPageSize(BUNDLES_PER_PAGE);
        loadPage(1);
    }, [user, configuration]);

    type TEnergyByType = {
        total: BN;
        solar: BN;
        wind: BN;
        hydro: BN;
        other: BN;
    };

    const currency = useSelector(getCurrencies).pop() ?? 'USD';

    const rows = paginatedData.map((bundle) => ({
        ...energyShares(bundle),
        price: `$ ${formatCurrencyComplete(bundle.price, currency)}`
    }));

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
            />
            <BundleDetails bundle={selectedBundle} showModal={showBundleDetailsModal} />
        </>
    );
};
