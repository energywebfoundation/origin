import React from 'react';
import { Configuration } from '@energyweb/utils-general';
import { CertificateLogic, Certificate } from '@energyweb/origin';
import { ProducingAsset } from '@energyweb/asset-registry';
import { Role } from '@energyweb/user-registry';
import { MarketUser } from '@energyweb/market';
import { showNotification, NotificationType } from '../utils/notifications';
import {
    PaginatedLoader,
    IPaginatedLoaderState,
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    getInitialPaginatedLoaderState
} from './Table/PaginatedLoader';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getProducingAssets, getConfiguration } from '../features/selectors';
import { TableMaterial } from './Table/TableMaterial';
import { Check } from '@material-ui/icons';
import { getCurrentUser } from '../features/users/selectors';
import { TSetLoading, setLoading } from '../features/general/actions';

interface IEnrichedData {
    certificationRequestId: number;
    asset: ProducingAsset.Entity;
    energy: number;
}

interface IState extends IPaginatedLoaderState {
    paginatedData: IEnrichedData[];
}

interface IOwnProps {
    approvedOnly?: boolean;
}

interface IStateProps {
    configuration: Configuration.Entity;
    producingAssets: ProducingAsset.Entity[];
    currentUser: MarketUser.Entity;
}

interface IDispatchProps {
    setLoading: TSetLoading;
}

type Props = IOwnProps & IStateProps & IDispatchProps;

class CertificationRequestsTableClass extends PaginatedLoader<Props, IState> {
    constructor(props: Props) {
        super(props);

        this.state = getInitialPaginatedLoaderState();
    }

    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.loadPage(1);
        }
    }

    async getPaginatedData({
        pageSize,
        offset
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        if (!this.props.currentUser || this.props.producingAssets.length === 0) {
            return {
                paginatedData: [],
                total: 0
            };
        }

        const view = this.props.approvedOnly ? 'approved' : 'pending';

        const isIssuer = this.props.currentUser.isRole(Role.Issuer);

        const certificateLogic: CertificateLogic = this.props.configuration.blockchainProperties
            .certificateLogicInstance;

        const requests = await certificateLogic.getCertificationRequests();

        let paginatedData = [];

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            const asset = this.props.producingAssets.find(a => a.id === request.assetId);

            if (
                (view === 'pending' && Number(request.status) !== 0) ||
                (view === 'approved' && Number(request.status) !== 1) ||
                (!isIssuer &&
                    this.props.currentUser.id.toLowerCase() !== asset.owner.address.toLowerCase())
            ) {
                continue;
            }

            const reads = await asset.getSmartMeterReads();

            const energy = reads
                .slice(request.readsStartIndex, Number(request.readsEndIndex) + 1)
                .reduce((a, b) => a + Number(b.energy), 0);

            paginatedData.push({
                certificationRequestId: i,
                asset,
                energy
            });
        }

        const total = paginatedData.length;

        paginatedData = paginatedData.slice(offset, offset + pageSize);

        return {
            paginatedData,
            total
        };
    }

    get actions() {
        const isIssuer = this.props.currentUser && this.props.currentUser.isRole(Role.Issuer);

        if (isIssuer && !this.props.approvedOnly) {
            return [
                {
                    icon: <Check />,
                    name: 'Approve',
                    onClick: (row: number) => this.approve(row)
                }
            ];
        }

        return [];
    }

    columns = [
        { id: 'facility', label: 'Facility' },
        { id: 'townCountry', label: 'Town, country' },
        { id: 'type', label: 'Type' },
        { id: 'capacity', label: 'Capacity (kW)' },
        { id: 'meterRead', label: 'Meter Read (kWh)' }
    ] as const;

    get rows() {
        return this.state.paginatedData.map(({ asset, energy }) => ({
            facility: asset.offChainProperties.facilityName,
            townCountry: asset.offChainProperties.address + ', ' + asset.offChainProperties.country,
            type: asset.offChainProperties.assetType,
            capacity: (asset.offChainProperties.capacityWh / 1000).toLocaleString(),
            meterRead: (energy / 1000).toLocaleString()
        }));
    }

    render() {
        const { total, pageSize } = this.state;

        return (
            <TableMaterial
                columns={this.columns}
                rows={this.rows}
                loadPage={this.loadPage}
                total={total}
                pageSize={pageSize}
                actions={this.actions}
            />
        );
    }

    async approve(rowIndex: number) {
        const certificationRequestId = this.state.paginatedData[rowIndex].certificationRequestId;

        const { configuration } = this.props;

        this.props.setLoading(true);

        try {
            await Certificate.approveCertificationRequest(certificationRequestId, configuration);

            showNotification(`Certification request approved.`, NotificationType.Success);

            await this.loadPage(1);
        } catch (error) {
            showNotification(`Could not approve certification request.`, NotificationType.Error);
            console.error(error);
        }

        this.props.setLoading(false);
    }
}

const dispatchProps: IDispatchProps = {
    setLoading
};

export const CertificationRequestsTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        currentUser: getCurrentUser(state),
        producingAssets: getProducingAssets(state)
    }),
    dispatchProps
)(CertificationRequestsTableClass);
