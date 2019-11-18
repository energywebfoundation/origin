import { ProducingAsset } from '@energyweb/asset-registry';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
import { Certificate } from '@energyweb/origin';
import { Demand, PurchasableCertificate } from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher';
import { User } from '@energyweb/user-registry';
import {
    Compliance,
    Configuration,
    Currency,
    TimeFrame,
    LocationService
} from '@energyweb/utils-general';
import { AddShoppingCart, AssignmentReturn, AssignmentTurnedIn, Publish } from '@material-ui/icons';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { BuyCertificateBulkModal } from '../elements/Modal/BuyCertificateBulkModal';
import { BuyCertificateModal } from '../elements/Modal/BuyCertificateModal';
import { PublishForSaleModal } from '../elements/Modal/PublishForSaleModal';
import { getBaseURL, getConfiguration, getProducingAssets } from '../features/selectors';
import { IStoreState } from '../types';
import { formatCurrency } from '../utils/helper';
import { NotificationType, showNotification } from '../utils/notifications';
import { getCertificateDetailLink } from '../utils/routing';
import { IBatchableAction } from './Table/ColumnBatchActions';
import { CustomFilterInputType, ICustomFilterDefinition } from './Table/FiltersHeader';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import { FILTER_SPECIAL_TYPES, RECORD_INDICATOR } from './Table/PaginatedLoaderFiltered';
import {
    getInitialPaginatedLoaderFilteredSortedState,
    IPaginatedLoaderFilteredSortedState,
    PaginatedLoaderFilteredSorted
} from './Table/PaginatedLoaderFilteredSorted';
import { TableMaterial } from './Table/TableMaterial';
import { getUserById, getUsers, getCurrentUser } from '../features/users/selectors';
import { setLoading, TSetLoading } from '../features/general/actions';
import { getCertificates } from '../features/certificates/selectors';
import { ClaimCertificateBulkModal } from '../elements/Modal/ClaimCertificateBulkModal';

interface IOwnProps {
    certificates?: PurchasableCertificate.Entity[];
    demand?: Demand.Entity;
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IStateProps {
    certificates: PurchasableCertificate.Entity[];
    configuration: Configuration.Entity;
    producingAssets: ProducingAsset.Entity[];
    currentUser: User.Entity;
    users: User.Entity[];
    baseURL: string;
}

interface IDispatchProps {
    setLoading: TSetLoading;
}

type Props = IOwnProps & IStateProps & IDispatchProps;

interface IEnrichedCertificateData {
    certificate: PurchasableCertificate.Entity;
    certificateOwner: User.Entity;
    producingAsset: ProducingAsset.Entity;
    currency: string;
    price: string;
    isOffChainSettlement: boolean;
    assetTypeLabel: string;
    producingAssetProvince: string;
    producingAssetRegion: string;
}

interface ICertificatesState extends IPaginatedLoaderFilteredSortedState {
    selectedState: SelectedState;
    selectedCertificates: PurchasableCertificate.Entity[];
    detailViewForCertificateId: string;
    matchedCertificates: PurchasableCertificate.Entity[];
    showSellModal: boolean;
    sellModalForCertificate: PurchasableCertificate.Entity;
    showBuyModal: boolean;
    buyModalForCertificate: PurchasableCertificate.Entity;
    buyModalForProducingAsset: ProducingAsset.Entity;
    showBuyBulkModal: boolean;
    showClaimBulkModal: boolean;
    paginatedData: IEnrichedCertificateData[];
}

export enum SelectedState {
    Inbox,
    Claimed,
    ForSale,
    ForDemand
}

class CertificateTableClass extends PaginatedLoaderFilteredSorted<Props, ICertificatesState> {
    private locationService = new LocationService();

    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            selectedState: SelectedState.Inbox,
            selectedCertificates: [],
            detailViewForCertificateId: null,
            matchedCertificates: null,
            showSellModal: false,
            sellModalForCertificate: null,
            showBuyModal: false,
            buyModalForCertificate: null,
            buyModalForProducingAsset: null,
            showBuyBulkModal: false,
            showClaimBulkModal: false,
            currentSort: ['certificate.certificate.creationTime'],
            sortAscending: false
        };

        this.getTokenSymbol = this.getTokenSymbol.bind(this);
        this.buyCertificateBulk = this.buyCertificateBulk.bind(this);
        this.claimCertificateBulk = this.claimCertificateBulk.bind(this);
        this.hidePublishForSaleModal = this.hidePublishForSaleModal.bind(this);
        this.hideBuyModal = this.hideBuyModal.bind(this);
        this.hideBuyBulkModal = this.hideBuyBulkModal.bind(this);
        this.hideClaimBulkModal = this.hideClaimBulkModal.bind(this);
        this.customSelectCounterGenerator = this.customSelectCounterGenerator.bind(this);
    }

    async componentDidMount() {
        if (this.props.selectedState === SelectedState.ForDemand && this.props.demand) {
            await this.initMatchingCertificates(this.props.demand);
        }

        await super.componentDidMount();
    }

    async componentDidUpdate(prevProps: Props) {
        if (
            this.props.demand &&
            (!this.state.matchedCertificates ||
                prevProps.certificates !== this.props.certificates) &&
            this.props.selectedState === SelectedState.ForDemand
        ) {
            await this.initMatchingCertificates(this.props.demand);
            await this.loadPage(1);
        } else if (
            prevProps.certificates !== this.props.certificates ||
            prevProps.users.length !== this.props.users.length
        ) {
            await this.loadPage(1);
        }
    }

    async getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const { currentUser, selectedState, certificates } = this.props;
        const { matchedCertificates } = this.state;

        const enrichedData = await this.enrichData(certificates);

        const filteredIEnrichedCertificateData = enrichedData.filter(
            (enrichedCertificateData: IEnrichedCertificateData) => {
                const ownerOf =
                    currentUser &&
                    currentUser.id.toLowerCase() ===
                        enrichedCertificateData.certificate.certificate.owner.toLowerCase();
                const claimed =
                    Number(enrichedCertificateData.certificate.certificate.status) ===
                    Certificate.Status.Claimed;
                const forSale = enrichedCertificateData.certificate.forSale;
                const forDemand =
                    matchedCertificates &&
                    matchedCertificates.find(
                        cert => cert.id === enrichedCertificateData.certificate.id
                    ) !== undefined;
                const isActive =
                    Number(enrichedCertificateData.certificate.certificate.status) ===
                    Certificate.Status.Active;

                return (
                    this.checkRecordPassesFilters(enrichedCertificateData, filters) &&
                    ((isActive && ownerOf && !forSale && selectedState === SelectedState.Inbox) ||
                        (claimed && selectedState === SelectedState.Claimed) ||
                        (isActive && forSale && selectedState === SelectedState.ForSale) ||
                        (isActive &&
                            forSale &&
                            forDemand &&
                            selectedState === SelectedState.ForDemand))
                );
            }
        );

        const sortedEnrichedData = this.sortData(filteredIEnrichedCertificateData);

        const paginatedData = sortedEnrichedData.slice(offset, offset + pageSize);
        const total = sortedEnrichedData.length;

        return {
            paginatedData,
            total
        };
    }

    async enrichData(certificates: PurchasableCertificate.Entity[]) {
        const enrichedData: IEnrichedCertificateData[] = [];

        for (const certificate of certificates) {
            const producingAsset =
                typeof certificate.certificate.assetId !== 'undefined' &&
                this.props.producingAssets.find(
                    asset => asset.id === certificate.certificate.assetId.toString()
                );

            let producingAssetRegion = '';
            let producingAssetProvince = '';
            try {
                const decodedLocation = this.locationService.decode([
                    this.locationService.translateAddress(
                        producingAsset.offChainProperties?.address,
                        producingAsset.offChainProperties?.country
                    )
                ])[0];

                producingAssetRegion = decodedLocation[1];
                producingAssetProvince = decodedLocation[2];
            } catch (error) {
                console.error('Error while parsing location', error);
            }

            enrichedData.push({
                certificate,
                producingAsset,
                assetTypeLabel: producingAsset?.offChainProperties?.assetType,
                certificateOwner: getUserById(this.props.users, certificate.certificate.owner),
                price: certificate.isOffChainSettlement
                    ? formatCurrency(certificate.price / 100)
                    : certificate.price?.toString(),
                currency: certificate.isOffChainSettlement
                    ? Currency[certificate.currency]
                    : await this.getTokenSymbol(certificate.currency),
                isOffChainSettlement: certificate.isOffChainSettlement,
                producingAssetProvince,
                producingAssetRegion
            });
        }

        return enrichedData;
    }

    async initMatchingCertificates(demand: Demand.Entity) {
        const { certificates, configuration } = this.props;

        const matchableDemand = new MatchableDemand(demand);
        const find = async certificate => {
            const producingAsset = await new ProducingAsset.Entity(
                certificate.assetId.toString(),
                configuration
            ).sync();
            const { result } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );
            return { result, certificate };
        };

        const matchedCertificates = (await Promise.all(certificates.map(find)))
            .filter(({ result }) => result)
            .map(({ certificate }) => certificate);

        this.setState({ matchedCertificates });
    }

    async getTokenSymbol(tokenAddress: string | Currency) {
        if (
            typeof tokenAddress === 'string' &&
            tokenAddress !== '0x0000000000000000000000000000000000000000'
        ) {
            const token = new Erc20TestToken(
                this.props.configuration.blockchainProperties.web3,
                tokenAddress
            );

            return token.web3Contract.methods.symbol().call();
        }

        return null;
    }

    async buyCertificate(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;
        const certificate: PurchasableCertificate.Entity = this.props.certificates.find(
            (cert: PurchasableCertificate.Entity) => cert.id === certificateId.toString()
        );

        if (
            certificate.certificate.owner?.toLowerCase() ===
            this.props.currentUser?.id?.toLowerCase()
        ) {
            showNotification(`You can't buy your own certificates.`, NotificationType.Error);

            return;
        }

        const asset: ProducingAsset.Entity = this.props.producingAssets.find(
            (a: ProducingAsset.Entity) => a.id === certificate.certificate.assetId.toString()
        );

        this.setState({
            buyModalForCertificate: certificate,
            buyModalForProducingAsset: asset,
            showBuyModal: true
        });
    }

    async buyCertificateBulk(selectedIndexes) {
        if (selectedIndexes.length === 0) {
            showNotification(
                `No certificates have been selected. Please select at least one certificate.`,
                NotificationType.Error
            );

            return;
        }

        // If we try to bulk buy more than 100 certificates it will probably
        // overflow the block gas limit
        if (selectedIndexes.length > 100) {
            showNotification(`Please select less than 100 certificates.`, NotificationType.Error);

            return;
        }

        const selectedCertificates = this.state.paginatedData
            .filter((item, index) => selectedIndexes.includes(index))
            .map(i => i.certificate);

        const isOwnerOfSomeCertificates = selectedCertificates.some(
            c => c.certificate.owner.toLowerCase() === this.props.currentUser.id.toLowerCase()
        );

        if (isOwnerOfSomeCertificates) {
            showNotification(`You can't buy your own certificates.`, NotificationType.Error);

            return;
        }

        this.setState({
            selectedCertificates,
            showBuyBulkModal: true
        });
    }

    async claimCertificateBulk(selectedIndexes) {
        if (selectedIndexes.length === 0) {
            showNotification(
                `No certificates have been selected. Please select at least one certificate.`,
                NotificationType.Error
            );

            return;
        }

        if (selectedIndexes.length > 100) {
            showNotification(`Please select less than 100 certificates.`, NotificationType.Error);

            return;
        }

        const selectedCertificates = this.state.paginatedData
            .filter((item, index) => selectedIndexes.includes(index))
            .map(i => i.certificate);

        this.setState({
            selectedCertificates,
            showClaimBulkModal: true
        });
    }

    async publishForSale(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;

        const certificate: PurchasableCertificate.Entity = this.props.certificates.find(
            cert => cert.id === certificateId.toString()
        );

        if (certificate.forSale) {
            showNotification(
                `Certificate ${certificate.id} has already been published for sale.`,
                NotificationType.Error
            );

            return;
        }

        this.setState({
            sellModalForCertificate: certificate,
            showSellModal: true
        });
    }

    hidePublishForSaleModal() {
        if (this.isMountedIndicator) {
            this.setState({
                sellModalForCertificate: null,
                showSellModal: false
            });
        }
    }

    async returnToInbox(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;

        const certificate = this.props.certificates.find(
            cert => cert.id === certificateId.toString()
        );

        if (
            !this.props.currentUser ||
            this.props.currentUser.id.toLowerCase() !== certificate.certificate.owner.toLowerCase()
        ) {
            showNotification(
                `You are not the owner of certificate ${certificate.id}.`,
                NotificationType.Error
            );

            return;
        }
        if (!certificate.forSale) {
            showNotification(
                `Certificate ${certificate.id} is already in Inbox.`,
                NotificationType.Error
            );

            return;
        }

        this.props.setLoading(true);
        await certificate.unpublishForSale();
        this.props.setLoading(false);

        showNotification(
            `Certificate ${certificate.id} has been returned to Inbox.`,
            NotificationType.Success
        );
    }

    async claimCertificate(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;

        const certificate: PurchasableCertificate.Entity = this.props.certificates.find(
            (cert: PurchasableCertificate.Entity) => cert.id === certificateId.toString()
        );

        if (
            certificate &&
            this.props.currentUser &&
            this.props.currentUser.id.toLowerCase() === certificate.certificate.owner.toLowerCase()
        ) {
            this.props.setLoading(true);
            await certificate.claimCertificate();
            this.props.setLoading(false);
            showNotification(
                `Certificate ${certificate.id} has been claimed.`,
                NotificationType.Success
            );
        }
    }

    async createDemandForCertificate(certificateId: number) {
        const certificate = this.props.certificates.find(
            (cert: PurchasableCertificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate) {
            let asset = this.props.producingAssets.find(
                (a: ProducingAsset.Entity) => a.id === certificate.certificate.assetId.toString()
            );
            if (!asset) {
                asset = await new ProducingAsset.Entity(
                    certificate.certificate.assetId.toString(),
                    this.props.configuration
                ).sync();
            }

            const offChainProperties: Demand.IDemandOffChainProperties = {
                timeFrame: TimeFrame.yearly,
                maxPricePerMwh: 0,
                currency: Currency.USD,
                otherGreenAttributes: asset.offChainProperties.otherGreenAttributes,
                typeOfPublicSupport: asset.offChainProperties.typeOfPublicSupport,
                energyPerTimeFrame: certificate.certificate.energy,
                registryCompliance: asset.offChainProperties.complianceRegistry,
                startTime: 0,
                endTime: 0
            };

            this.props.setLoading(true);
            await Demand.createDemand(offChainProperties, this.props.configuration);
            this.props.setLoading(false);
        }
    }

    showCertificateDetails(rowIndex: number) {
        this.setState({
            detailViewForCertificateId: this.state.paginatedData[rowIndex].certificate.id
        });
    }

    get filters(): ICustomFilterDefinition[] {
        if (![SelectedState.ForSale, SelectedState.Claimed].includes(this.props.selectedState)) {
            return [];
        }

        const maxCertificateEnergyInkWh =
            this.props.certificates.reduce(
                (a, b) =>
                    parseInt(b.certificate.energy.toString(), 10) > a
                        ? parseInt(b.certificate.energy.toString(), 10)
                        : a,
                0
            ) / 1000;

        return [
            {
                property: `${FILTER_SPECIAL_TYPES.COMBINE}::${RECORD_INDICATOR}producingAssetProvince::${RECORD_INDICATOR}producingAssetRegion`,
                label: 'Search',
                input: {
                    type: CustomFilterInputType.string
                },
                search: true
            },
            {
                property: `${RECORD_INDICATOR}producingAsset.offChainProperties.assetType`,
                label: 'Asset Type',
                input: {
                    type: CustomFilterInputType.assetType,
                    defaultOptions: []
                }
            },
            {
                property: `${FILTER_SPECIAL_TYPES.DATE_YEAR}::${RECORD_INDICATOR}producingAsset.offChainProperties.operationalSince`,
                label: 'Commissioning Date',
                input: {
                    type: CustomFilterInputType.dropdown,
                    availableOptions: new Array(40).fill(moment().year()).map((item, index) => ({
                        label: (item - index).toString(),
                        value: item - index
                    }))
                }
            },
            {
                property: `${FILTER_SPECIAL_TYPES.COMBINE}::${RECORD_INDICATOR}producingAssetProvince::, ::${RECORD_INDICATOR}producingAsset.producingAssetRegion`,
                label: 'Province, Region',
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: `${RECORD_INDICATOR}certificateOwner.organization`,
                label: 'Owner',
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: `${RECORD_INDICATOR}certificate.creationTime`,
                label: 'Certification Date',
                input: {
                    type: CustomFilterInputType.yearMonth
                }
            },
            {
                property: `${FILTER_SPECIAL_TYPES.DIVIDE}::${RECORD_INDICATOR}certificate.energy::1000`,
                label: 'Certified Energy (kWh)',
                input: {
                    type: CustomFilterInputType.slider,
                    min: 0,
                    max: maxCertificateEnergyInkWh
                }
            }
        ].filter(filter => !this.hiddenColumns.includes(filter.label));
    }

    hideBuyModal() {
        if (this.isMountedIndicator) {
            this.setState({
                showBuyModal: false,
                buyModalForCertificate: null,
                buyModalForProducingAsset: null
            });
        }
    }

    hideBuyBulkModal() {
        if (this.isMountedIndicator) {
            this.setState({
                showBuyBulkModal: false
            });
        }
    }

    hideClaimBulkModal() {
        this.setState({
            showClaimBulkModal: false
        });
    }

    customSelectCounterGenerator(selectedIndexes: number[]) {
        if (selectedIndexes.length > 0) {
            const selectedCertificates = this.state.paginatedData
                .filter((item, index) => selectedIndexes.includes(index))
                .map(i => i.certificate);

            const energy =
                selectedCertificates.reduce(
                    (a, b) => a + parseInt(b.certificate.energy.toString(), 10),
                    0
                ) / 1000;

            return `${selectedIndexes.length} selected (${energy} kWh)`;
        }
    }

    get batchableActions(): IBatchableAction[] {
        const actions = [];

        if ([SelectedState.ForSale, SelectedState.ForDemand].includes(this.props.selectedState)) {
            actions.push({
                label: 'Buy',
                handler: this.buyCertificateBulk
            });
        }

        if (this.props.selectedState === SelectedState.Inbox) {
            actions.push({
                label: 'Claim',
                handler: this.claimCertificateBulk
            });
        }

        return actions;
    }

    get actions() {
        const actions = [];

        const buyAction = {
            name: 'Buy',
            onClick: (row: number) => this.buyCertificate(row),
            icon: <AddShoppingCart />
        };

        switch (this.props.selectedState) {
            case SelectedState.Inbox:
                actions.push(
                    {
                        name: 'Claim',
                        icon: <AssignmentTurnedIn />,
                        onClick: (row: number) => this.claimCertificate(row)
                    },
                    {
                        name: 'Publish for sale',
                        icon: <Publish />,
                        onClick: (row: number) => this.publishForSale(row)
                    }
                );
                break;
            case SelectedState.ForSale:
                actions.push(buyAction, {
                    name: 'Return to inbox',
                    icon: <AssignmentReturn />,
                    onClick: (row: number) => this.returnToInbox(row)
                });
                break;
            case SelectedState.ForDemand:
                actions.push(buyAction);
                break;
        }

        return actions;
    }

    get hiddenColumns() {
        const hiddenColumns = this.props.hiddenColumns || [];

        const showPrice = [SelectedState.ForSale, SelectedState.ForDemand].includes(
            this.props.selectedState
        );

        if (!showPrice) {
            hiddenColumns.push('price', 'currency');
        }

        return hiddenColumns;
    }

    get columns() {
        return ([
            { id: 'assetType', label: 'Asset type', sortProperties: ['assetTypeLabel'] },
            {
                id: 'commissioningDate',
                label: 'Commissioning date',
                sortProperties: ['producingAsset.offChainProperties.operationalSince']
            },
            {
                id: 'provinceRegion',
                label: 'Province, region',
                sortProperties: ['producingAssetProvince', 'producingAssetRegion']
            },
            { id: 'compliance', label: 'Compliance' },
            { id: 'owner', label: 'Owner', sortProperties: ['certificateOwner.organization'] },
            {
                id: 'certificationDate',
                label: 'Certification date',
                sortProperties: ['certificate.creationTime']
            },
            { id: 'price', label: 'Price' },
            { id: 'currency', label: 'Currency' },
            {
                id: 'energy',
                label: 'Certified energy (kWh)',
                sortProperties: [['certificate.energy', (value: string) => parseInt(value, 10)]]
            }
        ] as const).filter(column => !this.hiddenColumns.includes(column.id));
    }

    get rows() {
        return this.state.paginatedData.map(enrichedData => {
            let assetType = '';
            let commissioningDate = '';
            let provinceRegion = '';
            let compliance = '';

            if (enrichedData.producingAsset && enrichedData.producingAsset.offChainProperties) {
                assetType = this.assetTypeService.getDisplayText(
                    enrichedData.producingAsset.offChainProperties.assetType
                );

                commissioningDate = moment(
                    enrichedData.producingAsset.offChainProperties.operationalSince * 1000,
                    'x'
                ).format('MMM YY');

                provinceRegion = `${enrichedData.producingAssetProvince}, ${enrichedData.producingAssetRegion}`;

                compliance =
                    Compliance[enrichedData.producingAsset.offChainProperties.complianceRegistry];
            }

            return {
                assetType,
                commissioningDate,
                provinceRegion,
                compliance,
                owner: enrichedData.certificateOwner && enrichedData.certificateOwner.organization,
                certificationDate: new Date(
                    enrichedData.certificate.certificate.creationTime * 1000
                ).toDateString(),
                price: enrichedData.price,
                currency: enrichedData.currency,
                energy: (enrichedData.certificate.certificate.energy / 1000).toLocaleString()
            };
        });
    }

    render() {
        const {
            buyModalForCertificate,
            buyModalForProducingAsset,
            currentSort,
            detailViewForCertificateId,
            pageSize,
            selectedCertificates,
            sellModalForCertificate,
            showBuyBulkModal,
            showBuyModal,
            showClaimBulkModal,
            showSellModal,
            sortAscending,
            total
        } = this.state;

        if (detailViewForCertificateId !== null) {
            return (
                <Redirect
                    push={true}
                    to={getCertificateDetailLink(this.props.baseURL, detailViewForCertificateId)}
                />
            );
        }

        return (
            <>
                <TableMaterial
                    columns={this.columns}
                    rows={this.rows}
                    loadPage={this.loadPage}
                    total={total}
                    pageSize={pageSize}
                    batchableActions={this.batchableActions}
                    customSelectCounterGenerator={this.customSelectCounterGenerator}
                    filters={this.filters}
                    handleRowClick={(row: number) => this.showCertificateDetails(row)}
                    actions={this.actions}
                    currentSort={currentSort}
                    sortAscending={sortAscending}
                    toggleSort={this.toggleSort}
                />

                <PublishForSaleModal
                    certificate={this.state.sellModalForCertificate}
                    producingAsset={
                        this.state.sellModalForCertificate
                            ? this.props.producingAssets.find(
                                  (asset: ProducingAsset.Entity) =>
                                      asset.id ===
                                      sellModalForCertificate.certificate.assetId.toString()
                              )
                            : null
                    }
                    showModal={showSellModal}
                    callback={this.hidePublishForSaleModal}
                />

                <BuyCertificateModal
                    certificate={buyModalForCertificate}
                    producingAsset={buyModalForProducingAsset}
                    showModal={showBuyModal}
                    callback={this.hideBuyModal}
                />

                <BuyCertificateBulkModal
                    certificates={selectedCertificates}
                    showModal={showBuyBulkModal}
                    callback={this.hideBuyBulkModal}
                />

                <ClaimCertificateBulkModal
                    certificates={selectedCertificates}
                    showModal={showClaimBulkModal}
                    callback={this.hideClaimBulkModal}
                />
            </>
        );
    }
}

const dispatchProps: IDispatchProps = {
    setLoading
};

export const CertificateTable = connect(
    (state: IStoreState, ownProps: IOwnProps): IStateProps => ({
        baseURL: getBaseURL(),
        certificates: ownProps.certificates || getCertificates(state),
        configuration: getConfiguration(state),
        currentUser: getCurrentUser(state),
        producingAssets: getProducingAssets(state),
        users: getUsers(state)
    }),
    dispatchProps
)(CertificateTableClass);
