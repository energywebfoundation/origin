import React, { useEffect } from 'react';
import { Certificate } from '@energyweb/origin';
import { Role } from '@energyweb/user-registry';
import { showNotification, NotificationType } from '../utils/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { getProducingAssets, getConfiguration } from '../features/selectors';
import { TableMaterial } from './Table/TableMaterial';
import { Check } from '@material-ui/icons';
import { getCurrentUser } from '../features/users/selectors';
import { setLoading } from '../features/general/actions';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from './Table/PaginatedLoaderHooks';
import { IRECAssetService, LocationService } from '@energyweb/utils-general';
import { ProducingAsset } from '@energyweb/asset-registry';

interface IProps {
    approvedOnly?: boolean;
}

const assetTypeService = new IRECAssetService();
const locationService = new LocationService();

interface IRecord {
    certificationRequestId: number;
    asset: ProducingAsset.Entity;
    energy: number;
}

export function CertificationRequestsTable(props: IProps) {
    const configuration = useSelector(getConfiguration);
    const currentUser = useSelector(getCurrentUser);
    const producingAssets = useSelector(getProducingAssets);

    const dispatch = useDispatch();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!currentUser || producingAssets.length === 0) {
            return {
                paginatedData: [],
                total: 0
            };
        }

        const view = props.approvedOnly ? 'approved' : 'pending';

        const isIssuer = currentUser.isRole(Role.Issuer);

        const requests = await configuration.blockchainProperties.certificateLogicInstance.getCertificationRequests();

        let newPaginatedData: IRecord[] = [];

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            const asset = producingAssets.find(a => a.id === request.assetId);

            if (
                (view === 'pending' && Number(request.status) !== 0) ||
                (view === 'approved' && Number(request.status) !== 1) ||
                (!isIssuer && currentUser.id.toLowerCase() !== asset?.owner.address.toLowerCase())
            ) {
                continue;
            }

            const reads = await asset.getSmartMeterReads();

            const energy = reads
                .slice(request.readsStartIndex, Number(request.readsEndIndex) + 1)
                .reduce((a, b) => a + Number(b.energy), 0);

            newPaginatedData.push({
                certificationRequestId: i,
                asset,
                energy
            });
        }

        const newTotal = newPaginatedData.length;

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoader<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [props.approvedOnly, currentUser, producingAssets.length]);

    async function approve(rowIndex: number) {
        const certificationRequestId = paginatedData[rowIndex].certificationRequestId;

        dispatch(setLoading(true));

        try {
            await Certificate.approveCertificationRequest(certificationRequestId, configuration);

            showNotification(`Certification request approved.`, NotificationType.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(`Could not approve certification request.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    const actions =
        currentUser?.isRole(Role.Issuer) && !props.approvedOnly
            ? [
                  {
                      icon: <Check />,
                      name: 'Approve',
                      onClick: (row: number) => approve(row)
                  }
              ]
            : [];

    const columns = [
        { id: 'facility', label: 'Facility' },
        { id: 'provinceRegion', label: 'Province, Region' },
        { id: 'type', label: 'Type' },
        { id: 'capacity', label: 'Capacity (kW)' },
        { id: 'meterRead', label: 'Meter Read (kWh)' }
    ] as const;

    const rows = paginatedData.map(({ asset, energy }) => {
        let assetRegion = '';
        let assetProvince = '';
        try {
            const decodedLocation = locationService.decode([
                locationService.translateAddress(
                    asset.offChainProperties.address,
                    asset.offChainProperties.country
                )
            ])[0];

            assetRegion = decodedLocation[1];
            assetProvince = decodedLocation[2];
        } catch (error) {
            console.error('CertificationRequestTable: Error while parsing location', error);
        }

        return {
            facility: asset.offChainProperties.facilityName,
            provinceRegion: assetProvince && assetRegion ? `${assetProvince}, ${assetRegion}` : '',
            type: assetTypeService.getDisplayText(asset.offChainProperties.assetType),
            capacity: (asset.offChainProperties.capacityWh / 1000).toLocaleString(),
            meterRead: (energy / 1000).toLocaleString()
        };
    });

    return (
        <TableMaterial
            columns={columns}
            rows={rows}
            loadPage={loadPage}
            total={total}
            pageSize={pageSize}
            actions={actions}
        />
    );
}
