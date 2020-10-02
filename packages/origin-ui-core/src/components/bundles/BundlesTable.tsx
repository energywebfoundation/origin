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
import { EnergyTypes } from '../../utils/device';
import { useSelector, useDispatch } from 'react-redux';
import { Role, isRole, UserStatus } from '@energyweb/origin-backend-core';
import { getUserOffchain } from '../../features/users/selectors';

import { Bundle, IExchangeClient } from '../../utils/exchange';
import { Visibility, Add, Cancel as CancelIcon } from '@material-ui/icons';
import BundleDetails from './BundleDetails';
import { getCurrencies, getEnvironment, getExchangeClient } from '../../features';
import { getBundles, getShowBundleDetails } from '../../features/bundles/selectors';
import { Fab, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { showBundleDetails, cancelBundle, storeBundle } from '../../features/bundles';
import { BundleBought } from '../Modal/BundleBought';
import { BigNumber } from 'ethers';

const BUNDLES_PER_PAGE = 25;
const BUNDLES_TOTAL_ENERGY_COLUMN_ID = 'total';
const BUNDLES_TOTAL_ENERGY_PROPERTIES = [
    (record) => Number(record.total.split(EnergyFormatter.displayUnit)[0].replace(',', ''))
];

interface IOwnProps {
    owner: boolean;
}

const ENERGY_COLUMNS_TO_DISPLAY = [EnergyTypes.SOLAR, EnergyTypes.WIND, EnergyTypes.HYDRO];

export const BundlesTable = (props: IOwnProps) => {
    const user = useSelector(getUserOffchain);
    const userIsActive = user && user.status === UserStatus.Active;
    const { owner = false } = props;
    const allBundles = useSelector(getBundles);
    const exchangeClient: IExchangeClient = useSelector(getExchangeClient);
    const bundles = allBundles
        .filter((b) => (owner ? b.own : true))
        .filter((b) => !(b.splits && b.splits.length === 0));
    const { t } = useTranslation();
    const devices = useSelector(getProducingDevices);
    const [selected, setSelected] = useState<Bundle>(null);
    const environment = useSelector(getEnvironment);
    const dispatch = useDispatch();
    const isBundleDetailsVisible = useSelector(getShowBundleDetails);
    const [showBundleBoughtModal, setShowBundleBoughtModal] = useState<boolean>(false);

    const { currentSort, sortAscending, sortData, toggleSort } = usePaginatedLoaderSorting({
        currentSort: {
            id: BUNDLES_TOTAL_ENERGY_COLUMN_ID,
            sortProperties: BUNDLES_TOTAL_ENERGY_PROPERTIES
        },
        sortAscending: false
    });
    const userIsActiveAndPartOfOrg = () =>
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

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

    const viewDetails = async (rowIndex: number) => {
        const { bundleId } = rows[rowIndex];
        const bundle = bundles.find((b) => b.id === bundleId);
        const { splits } = await exchangeClient.getBundleSplits(bundle);
        bundle.splits = splits.map((s) => ({
            volume: BigNumber.from(s.volume),
            items: s.items.map(({ id, volume }) => ({ id, volume: BigNumber.from(volume) }))
        }));
        dispatch(storeBundle(bundle));
        if (splits.length === 0) {
            return setShowBundleBoughtModal(true);
        }
        setSelected(bundle);
        dispatch(showBundleDetails(true));
    };

    const removeBundle = (rowIndex: number) => {
        const { bundleId } = rows[rowIndex];
        dispatch(cancelBundle(bundleId));
    };

    const columns = [
        {
            id: BUNDLES_TOTAL_ENERGY_COLUMN_ID,
            label: t('bundle.properties.total_energy'),
            sortProperties: BUNDLES_TOTAL_ENERGY_PROPERTIES
        },
        { id: EnergyTypes.SOLAR, label: t('bundle.properties.solar') },
        { id: EnergyTypes.WIND, label: t('bundle.properties.wind') },
        { id: EnergyTypes.HYDRO, label: t('bundle.properties.hydro') },
        { id: 'other', label: t('bundle.properties.other') },
        { id: 'price', label: t('bundle.properties.price') }
    ];

    const actions: any[] = [];

    if (isBundleDetailsVisible) {
        actions.push({
            icon: <Visibility />,
            name: 'View details',
            onClick: (row: string) => viewDetails(parseInt(row, 10))
        });
    }
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
            {userIsActiveAndPartOfOrg() && (
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
            )}
            <BundleBought open={showBundleBoughtModal} setOpen={setShowBundleBoughtModal} />
        </>
    );
};
