import React, { useEffect, useState } from 'react';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered
} from '../Table';
import { useTranslation } from '../../utils';
import { useSelector } from 'react-redux';
import { getExchangeClient, getConfiguration, getProducingDevices } from '../..';
import { Bundle } from '../../utils/exchange';
import { getUserOffchain } from '../../features/users/selectors';
import BN from 'bn.js';
import { Visibility } from '@material-ui/icons';
import { BundleDetails } from './BundleDetails';

const BUNDLES_PER_PAGE = 25;

export const BundlesTable = () => {
    const { t } = useTranslation();
    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const devices = useSelector(getProducingDevices);
    const [selectedBundle, setSelectedBundle] = useState<Bundle>(null);
    const [showBundleDetailsModal, setShowBundleDetailsModal] = useState<boolean>(false);
    const exchangeClient = useSelector(getExchangeClient);

    const columns = [
        { id: 'total', label: t('bundle.properties.total_energy') },
        { id: 'solar', label: t('bundle.properties.solar') },
        { id: 'wind', label: t('bundle.properties.wind') },
        { id: 'hydro', label: `${t('bundle.properties.hydro')}` },
        { id: 'other', label: t('bundle.properties.other') },
        { id: 'price', label: `${t('bundle.properties.price')}` }
    ];

    async function getBundles({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const availableBundles: Bundle[] = await exchangeClient.getAvailableBundles();
        const total = availableBundles.length;
        const paginatedData = availableBundles.slice(offset, offset + requestedPageSize);
        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize, setPageSize } = usePaginatedLoaderFiltered<
        Bundle
    >({
        getPaginatedData: getBundles
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

    const energyByType = (bundle: Bundle): TEnergyByType => {
        return bundle.items.reduce(
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
    };

    const energyShares = (bundle: Bundle) /* : TEnergyByType */ => {
        const energy = energyByType(bundle);
        return Object.fromEntries(
            Object.keys(energy)
                .filter((p) => p === 'total')
                .map((p) => [p, energy[p].div(energy.total)])
                .map(([p, v]) => [p, `${Number(v).toFixed(2)} %`])
        ) /* as TEnergyByType */;
    };
    const locale = 'en-En'; // retrive from storage
    const priceFormatter = Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
        useGrouping: true,
        maximumFractionDigits: 2
    });

    const rows = paginatedData.map((bundle) => ({
        ...energyShares(bundle),
        price: `$ ${priceFormatter.format(bundle.price)}`
    }));

    const viewDetails = (rowIndex) => {
        const bundle = paginatedData[rowIndex];
        setSelectedBundle(bundle);
        setShowBundleDetailsModal(true);
    };

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
            />
            <BundleDetails bundle={selectedBundle} showModal={showBundleDetailsModal} />
        </>
    );
};
