import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand } from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher';
import { Certificate, TradableEntity } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';
import { Compliance, Configuration, Currency, TimeFrame } from '@energyweb/utils-general';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
import moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { BuyCertificateBulkModal } from '../elements/Modal/BuyCertificateBulkModal';
import { BuyCertificateModal } from '../elements/Modal/BuyCertificateModal';
import { PublishForSaleModal } from '../elements/Modal/PublishForSaleModal';
import {
    getBaseURL,
    getCertificates,
    getConfiguration,
    getCurrentUser,
    getProducingAssets
} from '../features/selectors';
import { IStoreState } from '../types';
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
import { Publish, AssignmentReturn, AssignmentTurnedIn, AddShoppingCart } from '@material-ui/icons';
import { formatCurrency } from '../utils/Helper';

interface IOwnProps {
    certificates?: Certificate.Entity[];
    demand?: Demand.Entity;
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IStateProps {
    certificates: Certificate.Entity[];
    configuration: Configuration.Entity;
    producingAssets: ProducingAsset.Entity[];
    currentUser: User.Entity;
    baseURL: string;
}

type Props = IOwnProps & IStateProps;

interface IEnrichedCertificateData {
    certificate: Certificate.Entity;
    certificateOwner: User.Entity;
    producingAsset: ProducingAsset.Entity;
    acceptedCurrency: string;
    offChainSettlementOptions: TradableEntity.IOffChainSettlementOptions;
    isOffChainSettlement: boolean;
    assetTypeLabel: string;
}

interface ICertificatesState extends IPaginatedLoaderFilteredSortedState {
    selectedState: SelectedState;
    selectedCertificates: Certificate.Entity[];
    detailViewForCertificateId: string;
    matchedCertificates: Certificate.Entity[];
    showSellModal: boolean;
    sellModalForCertificate: Certificate.Entity;
    showBuyModal: boolean;
    buyModalForCertificate: Certificate.Entity;
    buyModalForProducingAsset: ProducingAsset.Entity;
    showBuyBulkModal: boolean;
    paginatedData: IEnrichedCertificateData[];
}

export enum SelectedState {
    Inbox,
    Claimed,
    ForSale,
    ForDemand
}

class CertificateTableClass extends PaginatedLoaderFilteredSorted<Props, ICertificatesState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            selectedState: SelectedState.Inbox,
            selectedCertificates: [],
            detailViewForCertificateId: null,
            matchedCertificates: [],
            showSellModal: false,
            sellModalForCertificate: null,
            showBuyModal: false,
            buyModalForCertificate: null,
            buyModalForProducingAsset: null,
            showBuyBulkModal: false,
            currentSort: ['certificate.creationTime'],
            sortAscending: false
        };

        this.getTokenSymbol = this.getTokenSymbol.bind(this);
        this.buyCertificateBulk = this.buyCertificateBulk.bind(this);
        this.hidePublishForSaleModal = this.hidePublishForSaleModal.bind(this);
        this.hideBuyModal = this.hideBuyModal.bind(this);
        this.hideBuyBulkModal = this.hideBuyBulkModal.bind(this);
        this.customSelectCounterGenerator = this.customSelectCounterGenerator.bind(this);
    }

    async componentDidMount() {
        if (this.props.selectedState === SelectedState.ForDemand && this.props.demand) {
            await this.initMatchingCertificates(this.props.demand);
        }

        await super.componentDidMount();
    }

    async componentDidUpdate(newProps: Props) {
        if (newProps.certificates !== this.props.certificates) {
            await this.loadPage(1);
        }
    }

    async getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedData = await this.enrichData(this.props.certificates);

        const filteredIEnrichedCertificateData = enrichedData.filter(
            (enrichedCertificateData: IEnrichedCertificateData) => {
                const ownerOf =
                    this.props.currentUser &&
                    this.props.currentUser.id.toLowerCase() ===
                        enrichedCertificateData.certificate.owner.toLowerCase();
                const claimed =
                    Number(enrichedCertificateData.certificate.status) ===
                    Certificate.Status.Retired;
                const forSale = enrichedCertificateData.certificate.forSale;
                const forDemand =
                    this.state.matchedCertificates.find(
                        cert => cert.id === enrichedCertificateData.certificate.id
                    ) !== undefined;
                const isActive =
                    Number(enrichedCertificateData.certificate.status) ===
                    Certificate.Status.Active;

                if (!this.checkRecordPassesFilters(enrichedCertificateData, filters)) {
                    return false;
                }

                return (
                    (isActive &&
                        ownerOf &&
                        !forSale &&
                        this.props.selectedState === SelectedState.Inbox) ||
                    (claimed && this.props.selectedState === SelectedState.Claimed) ||
                    (isActive && forSale && this.props.selectedState === SelectedState.ForSale) ||
                    (isActive &&
                        forSale &&
                        forDemand &&
                        this.props.selectedState === SelectedState.ForDemand)
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

    async enrichData(certificates: Certificate.Entity[]) {
        const enrichedData = [];

        for (const certificate of certificates) {
            let acceptedCurrency = await this.getTokenSymbol(certificate);
            const isOffChainSettlement = certificate.forSale && acceptedCurrency === null;
            let offChainSettlementOptions;

            if (isOffChainSettlement) {
                try {
                    offChainSettlementOptions = await certificate.getOffChainSettlementOptions();
                    acceptedCurrency = Currency[offChainSettlementOptions.currency];
                } catch (error) {
                    console.error('No off-chain settlement data for certificate.', error);
                }
            }

            const producingAsset = this.props.producingAssets.find(
                (asset: ProducingAsset.Entity) => asset.id === certificate.assetId.toString()
            );

            enrichedData.push({
                certificate,
                producingAsset,
                assetTypeLabel: producingAsset.offChainProperties.assetType,
                certificateOwner: await new User.Entity(certificate.owner, this.props
                    .configuration as any).sync(),
                offChainSettlementOptions,
                acceptedCurrency,
                isOffChainSettlement
            });
        }

        return enrichedData;
    }

    async initMatchingCertificates(demand: Demand.Entity) {
        const matchableDemand = new MatchableDemand(demand);
        const matchedCertificates = this.props.certificates.filter(async certificate => {
            const producingAsset = await new ProducingAsset.Entity(
                certificate.assetId.toString(),
                this.props.configuration
            ).sync();
            const { result } = matchableDemand.matchesCertificate(certificate, producingAsset);
            return result;
        });

        this.setState({ matchedCertificates });
    }

    async getTokenSymbol(certificate) {
        if (
            certificate.acceptedToken &&
            certificate.acceptedToken !== '0x0000000000000000000000000000000000000000'
        ) {
            const token = new Erc20TestToken(
                this.props.configuration.blockchainProperties.web3,
                certificate.acceptedToken
            );

            return token.web3Contract.methods.symbol().call();
        }

        return null;
    }

    async buyCertificate(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate.owner === this.props.currentUser.id) {
            showNotification(`You can't buy your own certificates.`, NotificationType.Error);

            return;
        }

        const asset: ProducingAsset.Entity = this.props.producingAssets.find(
            (a: ProducingAsset.Entity) => a.id === certificate.assetId.toString()
        );

        asset.configuration.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        certificate.configuration.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

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
            c => c.owner === this.props.currentUser.id
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

    async publishForSale(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;

        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate.forSale) {
            showNotification(
                `Certificate ${certificate.id} has already been published for sale.`,
                NotificationType.Error
            );

            return;
        }

        certificate.configuration.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        this.setState({
            sellModalForCertificate: certificate,
            showSellModal: true
        });
    }

    hidePublishForSaleModal() {
        this.setState({
            sellModalForCertificate: null,
            showSellModal: false
        });
    }

    async returnToInbox(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;

        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (
            !this.props.currentUser ||
            this.props.currentUser.id.toLowerCase() !== certificate.owner.toLowerCase()
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

        certificate.configuration.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        await certificate.unpublishForSale();
        showNotification(
            `Certificate ${certificate.id} has been returned to Inbox.`,
            NotificationType.Success
        );
    }

    async claimCertificate(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;

        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (
            certificate &&
            this.props.currentUser &&
            this.props.currentUser.id.toLowerCase() === certificate.owner.toLowerCase()
        ) {
            certificate.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

            await certificate.retireCertificate();
            showNotification(
                `Certificate ${certificate.id} has been claimed.`,
                NotificationType.Success
            );
        }
    }

    async createDemandForCertificate(certificateId: number) {
        const certificate = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate) {
            let asset = this.props.producingAssets.find(
                (a: ProducingAsset.Entity) => a.id === certificate.assetId.toString()
            );
            if (!asset) {
                asset = await new ProducingAsset.Entity(
                    certificate.assetId.toString(),
                    this.props.configuration
                ).sync();
            }

            const offChainProperties: Demand.IDemandOffChainProperties = {
                timeFrame: TimeFrame.yearly,
                maxPricePerMwh: 0,
                currency: Currency.USD,
                producingAsset: certificate.assetId.toString(),
                consumingAsset: '0',
                otherGreenAttributes: asset.offChainProperties.otherGreenAttributes,
                typeOfPublicSupport: asset.offChainProperties.typeOfPublicSupport,
                targetWhPerPeriod: certificate.powerInW,
                registryCompliance: asset.offChainProperties.complianceRegistry,
                startTime: '',
                endTime: ''
            };

            await Demand.createDemand(offChainProperties, this.props.configuration);
        }
    }

    showCertificateDetails(rowIndex: number) {
        this.setState({
            detailViewForCertificateId: this.state.paginatedData[rowIndex].certificate.id
        });
    }

    get filters(): ICustomFilterDefinition[] {
        if (this.props.selectedState !== SelectedState.ForSale) {
            return [];
        }

        const maxCertificateEnergyInkWh =
            this.props.certificates.reduce(
                (a, b) =>
                    parseInt(b.powerInW.toString(), 10) > a
                        ? parseInt(b.powerInW.toString(), 10)
                        : a,
                0
            ) / 1000;

        return [
            {
                property: `${RECORD_INDICATOR}producingAsset.offChainProperties.assetType`,
                label: 'Asset Type',
                input: {
                    type: CustomFilterInputType.multiselect,
                    availableOptions: [
                        {
                            label: 'Solar',
                            value: 'Solar'
                        },
                        {
                            label: 'Wind',
                            value: 'Wind'
                        },
                        {
                            label: 'Agricultural gas',
                            value: 'Gaseous;Agricultural gas'
                        },
                        {
                            label: 'Hydro',
                            value: 'Hydro-electric Head;Run-of-river head installation'
                        }
                    ],
                    defaultOptions: [
                        'Solar',
                        'Wind',
                        'Gaseous;Agricultural gas',
                        'Hydro-electric Head;Run-of-river head installation'
                    ]
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
                property: `${FILTER_SPECIAL_TYPES.COMBINE}::${RECORD_INDICATOR}producingAsset.offChainProperties.city::, ::${RECORD_INDICATOR}producingAsset.offChainProperties.country`,
                label: 'Town, Country',
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
                property: `${FILTER_SPECIAL_TYPES.DIVIDE}::${RECORD_INDICATOR}certificate.powerInW::1000`,
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
        this.setState({
            showBuyModal: false,
            buyModalForCertificate: null,
            buyModalForProducingAsset: null
        });
    }

    hideBuyBulkModal() {
        this.setState({
            showBuyBulkModal: false
        });
    }

    customSelectCounterGenerator(selectedIndexes: number[]) {
        if (selectedIndexes.length > 0) {
            const selectedCertificates = this.state.paginatedData
                .filter((item, index) => selectedIndexes.includes(index))
                .map(i => i.certificate);

            const energy =
                selectedCertificates.reduce((a, b) => a + parseInt(b.powerInW.toString(), 10), 0) /
                1000;

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

        const showPrice = [
            SelectedState.ForSale,
            SelectedState.ForDemand,
            SelectedState.Claimed
        ].includes(this.props.selectedState);

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
                id: 'townCountry',
                label: 'Town, country',
                sortProperties: [
                    'producingAsset.offChainProperties.country',
                    'producingAsset.offChainProperties.city'
                ]
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
                sortProperties: [['certificate.powerInW', (value: string) => parseInt(value, 10)]]
            }
        ] as const).filter(column => !this.hiddenColumns.includes(column.id));
    }

    get rows() {
        return this.state.paginatedData.map(enrichedData => ({
            assetType: enrichedData.producingAsset.offChainProperties.assetType,
            commissioningDate: moment(
                enrichedData.producingAsset.offChainProperties.operationalSince * 1000,
                'x'
            ).format('MMM YY'),
            townCountry: `${enrichedData.producingAsset.offChainProperties.city}, ${enrichedData.producingAsset.offChainProperties.country}`,
            compliance:
                Compliance[enrichedData.producingAsset.offChainProperties.complianceRegistry],
            owner: enrichedData.certificateOwner.organization,
            certificationDate: new Date(
                enrichedData.certificate.creationTime * 1000
            ).toDateString(),
            price: enrichedData.isOffChainSettlement
                ? formatCurrency(enrichedData.offChainSettlementOptions.price / 100)
                : enrichedData.certificate.onChainDirectPurchasePrice.toLocaleString(),
            currency: enrichedData.acceptedCurrency,
            energy: (enrichedData.certificate.powerInW / 1000).toLocaleString()
        }));
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
                    conf={this.props.configuration}
                    certificate={this.state.sellModalForCertificate}
                    producingAsset={
                        this.state.sellModalForCertificate
                            ? this.props.producingAssets.find(
                                  (asset: ProducingAsset.Entity) =>
                                      asset.id === sellModalForCertificate.assetId.toString()
                              )
                            : null
                    }
                    showModal={showSellModal}
                    callback={this.hidePublishForSaleModal}
                />

                <BuyCertificateModal
                    conf={this.props.configuration}
                    certificate={buyModalForCertificate}
                    producingAsset={buyModalForProducingAsset}
                    showModal={showBuyModal}
                    callback={this.hideBuyModal}
                />

                <BuyCertificateBulkModal
                    conf={this.props.configuration}
                    certificates={selectedCertificates}
                    showModal={showBuyBulkModal}
                    callback={this.hideBuyBulkModal}
                />
            </>
        );
    }
}

export const CertificateTable = connect(
    (state: IStoreState, ownProps: IOwnProps): IStateProps => ({
        baseURL: getBaseURL(state),
        certificates: ownProps.certificates || getCertificates(state),
        configuration: getConfiguration(state),
        currentUser: getCurrentUser(state),
        producingAssets: getProducingAssets(state)
    })
)(CertificateTableClass);
