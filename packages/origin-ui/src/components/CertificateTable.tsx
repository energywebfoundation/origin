// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { Certificate, TradableEntity } from '@energyweb/origin';
import { ProducingAsset } from '@energyweb/asset-registry';
import { User } from '@energyweb/user-registry';
import { Demand } from '@energyweb/market';
import { Configuration, TimeFrame, Currency } from '@energyweb/utils-general';
import { MatcherLogic } from '@energyweb/market-matcher';

import TableUtils from './Table/TableUtils';
import { showNotification, NotificationType } from '../utils/notifications';
import { PublishForSaleModal } from '../elements/Modal/PublishForSaleModal';
import { BuyCertificateModal } from '../elements/Modal/BuyCertificateModal';
import { BuyCertificateBulkModal } from '../elements/Modal/BuyCertificateBulkModal';
import { Erc20TestToken } from 'ew-erc-test-contracts';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import { IBatchableAction } from './Table/ColumnBatchActions';
import { AdvancedTable } from './Table/AdvancedTable';
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import { RECORD_INDICATOR, FILTER_SPECIAL_TYPES } from './Table/PaginatedLoaderFiltered';
import {
    PaginatedLoaderFilteredSorted,
    IPaginatedLoaderFilteredSortedState,
    getInitialPaginatedLoaderFilteredSortedState
} from './Table/PaginatedLoaderFilteredSorted';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getBaseURL, getCertificates, getConfiguration, getCurrentUser, getProducingAssets } from '../features/selectors';
import { getCertificateDetailLink } from '../utils/routing';

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

export interface IEnrichedCertificateData {
    certificate: Certificate.Entity;
    certificateOwner: User.Entity;
    producingAsset: ProducingAsset.Entity;
    acceptedCurrency: string;
    offChainSettlementOptions: TradableEntity.IOffChainSettlementOptions;
    isOffChainSettlement: boolean;
    assetTypeLabel: string;
}

export interface ICertificatesState extends IPaginatedLoaderFilteredSortedState {
    selectedState: SelectedState;
    selectedCertificates: Certificate.Entity[];
    detailViewForCertificateId: number;
    matchedCertificates: Certificate.Entity[];
    shouldShowPrice: boolean;
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

export enum OPERATIONS {
    PUBLISH_FOR_SALE = 'Publish For Sale',
    RETURN_TO_INBOX = 'Return to Inbox',
    CLAIM = 'Claim',
    BUY = 'Buy',
    SHOW_CLAIMING_TX = 'Show Claiming Transaction',
    SHOW_CREATION_TX = 'Show Certificate Creation Transaction',
    SHOW_LOGGING_TX = 'Show Initial Logging Transaction',
    SHOW_DETAILS = 'Show Certificate Details'
}

interface ICertificateTableColumn {
    label: string;
    width?: number;
    displayValue?: (enrichedData: IEnrichedCertificateData) => string | number;
    right?: boolean;
    body?: boolean;
    sortProperties?: any[];
}

const DEFAULT_COLUMNS: ICertificateTableColumn[] = [
    {
        label: '#',
        width: 60,
        displayValue: (enrichedData: IEnrichedCertificateData) => enrichedData.certificate.id
    },
    {
        label: 'Asset Type',
        sortProperties: ['assetTypeLabel'],
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            ProducingAsset.Type[enrichedData.producingAsset.offChainProperties.assetType]
    },
    {
        label: 'Commissioning Date',
        sortProperties: ['producingAsset.offChainProperties.operationalSince'],
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            moment(
                enrichedData.producingAsset.offChainProperties.operationalSince * 1000,
                'x'
            ).format('MMM YY')
    },
    {
        label: 'Town, Country',
        sortProperties: [
            'producingAsset.offChainProperties.country',
            'producingAsset.offChainProperties.city'
        ],
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            `${enrichedData.producingAsset.offChainProperties.city}, ${enrichedData.producingAsset.offChainProperties.country}`
    },
    {
        label: 'Compliance',
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            ProducingAsset.Compliance[
                enrichedData.producingAsset.offChainProperties.complianceRegistry
            ]
    },
    {
        label: 'Owner',
        sortProperties: ['certificateOwner.organization'],
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            enrichedData.certificateOwner.organization
    },
    {
        label: 'Certification Date',
        sortProperties: ['certificate.creationTime'],
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            new Date(enrichedData.certificate.creationTime * 1000).toDateString()
    },
    {
        label: 'Certified Energy (kWh)',
        sortProperties: [['certificate.powerInW', value => parseInt(value, 10)]],
        displayValue: (enrichedData: IEnrichedCertificateData) =>
            enrichedData.certificate.powerInW / 1000,
        right: true,
        body: true
    }
];

class CertificateTableClass extends PaginatedLoaderFilteredSorted<
    Props,
    ICertificatesState
> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            selectedState: SelectedState.Inbox,
            selectedCertificates: [],
            detailViewForCertificateId: null,
            matchedCertificates: [],
            shouldShowPrice: [
                SelectedState.ForSale,
                SelectedState.ForDemand,
                SelectedState.Claimed
            ].includes(props.selectedState),
            showSellModal: false,
            sellModalForCertificate: null,
            showBuyModal: false,
            buyModalForCertificate: null,
            buyModalForProducingAsset: null,
            showBuyBulkModal: false,
            currentSort: ['certificate.creationTime'],
            sortAscending: false
        };

        this.publishForSale = this.publishForSale.bind(this);
        this.claimCertificate = this.claimCertificate.bind(this);
        this.operationClicked = this.operationClicked.bind(this);
        this.showTxClaimed = this.showTxClaimed.bind(this);
        this.showCertCreated = this.showCertCreated.bind(this);
        this.showCertificateDetails = this.showCertificateDetails.bind(this);
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

    get visibleColumns(): ICertificateTableColumn[] {
        return DEFAULT_COLUMNS.filter(
            column => !this.props.hiddenColumns || !this.props.hiddenColumns.includes(column.label)
        );
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
                    this.props.currentUser.id === enrichedCertificateData.certificate.owner;
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

        const formattedPaginatedData = paginatedData.map(
            (enrichedData: IEnrichedCertificateData) => {
                const certificateDataToShow = this.visibleColumns.map(column =>
                    column.displayValue(enrichedData)
                );

                if (this.state.shouldShowPrice) {
                    const formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    });

                    certificateDataToShow.splice(
                        certificateDataToShow.length - 1,
                        0,
                        enrichedData.isOffChainSettlement
                            ? formatter
                                  .format(enrichedData.offChainSettlementOptions.price / 100)
                                  .replace('$', '')
                            : enrichedData.certificate.onChainDirectPurchasePrice
                    );
                    certificateDataToShow.splice(
                        certificateDataToShow.length - 1,
                        0,
                        enrichedData.acceptedCurrency
                    );
                }

                return certificateDataToShow;
            }
        );

        return {
            paginatedData,
            formattedPaginatedData,
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
                assetTypeLabel: ProducingAsset.Type[producingAsset.offChainProperties.assetType],
                certificateOwner: await new User.Entity(certificate.owner, this.props.configuration as any).sync(),
                offChainSettlementOptions,
                acceptedCurrency,
                isOffChainSettlement
            });
        }

        return enrichedData;
    }

    async initMatchingCertificates(demand: Demand.Entity) {
        const matchedCertificates: Certificate.Entity[] = await MatcherLogic.findMatchingCertificatesForDemand(
            demand,
            this.props.configuration,
            this.props.certificates
        );

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

            return await token.web3Contract.methods.symbol().call();
        }

        return null;
    }

    async buyCertificate(certificateId: number) {
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

    async publishForSale(certificateId: number) {
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

    async returnToInbox(certificateId: number) {
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (!this.props.currentUser || this.props.currentUser.id !== certificate.owner) {
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

    async claimCertificate(certificateId: number) {
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );
        if (
            certificate &&
            this.props.currentUser &&
            this.props.currentUser.id === certificate.owner
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

    async showTxClaimed(certificateId: number) {
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );
        if (certificate) {
            // TODO:
            // const claimedEvent = (await certificate.getCertificateEvents()).find((e) => e.event === 'LogRetireRequest');
            // window.open('https://tobalaba.etherscan.com/tx/' + claimedEvent.transactionHash, claimedEvent.transactionHash);
        }
    }

    async showCertCreated(certificateId: number) {
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate) {
            // TODO
            // const createdEvent = (await certificate.getCertificateEvents()).find((e) => e.event === 'LogCreatedCertificate');
            // window.open('https://tobalaba.etherscan.com/tx/' + createdEvent.transactionHash, createdEvent.transactionHash);
        }
    }

    async showInitialLoggingTx(certificateId: number) {
        const certificate = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );
        if (certificate) {
            const asset = this.props.producingAssets.find(
                (a: ProducingAsset.Entity) => a.id === certificate.assetId.toString()
            );
            // const logEvent = (await asset.getEventWithFileHash(certificate.dataLog))[0];
            // console.log(logEvent);
            // window.open('https://tobalaba.etherscan.com/tx/' + logEvent.transactionHash, logEvent.transactionHash);
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
                timeframe: TimeFrame.yearly,
                maxPricePerMwh: 0,
                currency: Currency.USD,
                productingAsset: certificate.assetId,
                consumingAsset: 0,
                locationCountry: asset.offChainProperties.country,
                locationRegion: asset.offChainProperties.region,
                // assettype: asset.offChainProperties.assetType,
                // minCO2Offset: ((certificate.offChainProperties.coSaved * 1000) / certificate.powerInW) / 10,
                otherGreenAttributes: asset.offChainProperties.otherGreenAttributes,
                typeOfPublicSupport: asset.offChainProperties.typeOfPublicSupport,
                targetWhPerPeriod: certificate.powerInW,
                registryCompliance: asset.offChainProperties.complianceRegistry,
                startTime: '',
                endTime: ''
            };

            const onChainProperties: Demand.IDemandOnChainProperties = {
                demandOwner: asset.owner.address,
                propertiesDocumentHash: '',
                url: '',
                status: Demand.DemandStatus.ACTIVE
            };

            await Demand.createDemand(onChainProperties, offChainProperties, this.props.configuration);
        }
    }

    showCertificateDetails(certificateId: number) {
        this.setState({
            detailViewForCertificateId: certificateId
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

        const filters = [
            {
                property: `${RECORD_INDICATOR}producingAsset.offChainProperties.assetType`,
                label: 'Asset Type',
                input: {
                    type: CustomFilterInputType.multiselect,
                    availableOptions: [
                        {
                            label: 'Solar',
                            value: ProducingAsset.Type.Solar
                        },
                        {
                            label: 'Wind',
                            value: ProducingAsset.Type.Wind
                        },
                        {
                            label: 'Biomass Gas',
                            value: ProducingAsset.Type.BiomassGas
                        },
                        {
                            label: 'Hydro',
                            value: ProducingAsset.Type.RunRiverHydro
                        }
                    ],
                    defaultOptions: [
                        ProducingAsset.Type.Solar,
                        ProducingAsset.Type.Wind,
                        ProducingAsset.Type.BiomassGas,
                        ProducingAsset.Type.RunRiverHydro
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
        ].filter(
            filter => !this.props.hiddenColumns || !this.props.hiddenColumns.includes(filter.label)
        );

        return filters;
    }

    async operationClicked(key: string, id: number) {
        switch (key) {
            case OPERATIONS.PUBLISH_FOR_SALE:
                this.publishForSale(id);
                break;
            case OPERATIONS.RETURN_TO_INBOX:
                this.returnToInbox(id);
                break;
            case OPERATIONS.CLAIM:
                this.claimCertificate(id);
                break;
            case OPERATIONS.BUY:
                await this.buyCertificate(id);
                break;
            case OPERATIONS.SHOW_CLAIMING_TX:
                this.showTxClaimed(id);
                break;
            case OPERATIONS.SHOW_CREATION_TX:
                this.showCertCreated(id);
                break;
            case OPERATIONS.SHOW_LOGGING_TX:
                // this.showInitialLoggingTx(id);
                break;
            case OPERATIONS.SHOW_DETAILS:
                this.showCertificateDetails(id);
                break;
            default:
        }
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

    render() {
        const {
            buyModalForCertificate,
            buyModalForProducingAsset,
            currentSort,
            detailViewForCertificateId,
            formattedPaginatedData,
            pageSize,
            selectedCertificates,
            sellModalForCertificate,
            shouldShowPrice,
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

        const defaultWidth = 106;
        const generateFooter = TableUtils.generateFooter;

        const columns = this.visibleColumns;

        if (shouldShowPrice) {
            columns.splice(columns.length - 1, 0, {
                label: 'Price'
            });
            columns.splice(columns.length - 1, 0, {
                label: 'Currency'
            });
        }

        const TableHeader = columns.map(column => {
            return TableUtils.generateHeader(
                column.label,
                column.width || defaultWidth,
                column.right,
                column.body,
                column.sortProperties
            );
        });

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: TableHeader.length - 1
            },
            generateFooter('Certified Energy (kWh)', true)
        ];

        const operations = [];
        const batchableActions: IBatchableAction[] = [];

        switch (this.props.selectedState) {
            case SelectedState.Inbox:
                operations.push(OPERATIONS.CLAIM, OPERATIONS.PUBLISH_FOR_SALE);
                break;
            case SelectedState.ForSale:
                operations.push(OPERATIONS.BUY, OPERATIONS.RETURN_TO_INBOX);
                batchableActions.push({
                    label: 'Buy',
                    handler: this.buyCertificateBulk
                });
                break;
            case SelectedState.Claimed:
                operations.push(OPERATIONS.SHOW_CLAIMING_TX);
                break;
            case SelectedState.ForDemand:
                operations.push(OPERATIONS.BUY);
                break;
        }

        operations.push(
            OPERATIONS.SHOW_CREATION_TX,
            OPERATIONS.SHOW_LOGGING_TX,
            OPERATIONS.SHOW_DETAILS
        );

        return (
            <div className="CertificateTableWrapper">
                <AdvancedTable
                    operationClicked={this.operationClicked}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    data={formattedPaginatedData}
                    actionWidth={55.39}
                    operations={operations}
                    loadPage={this.loadPage}
                    total={total}
                    pageSize={pageSize}
                    batchableActions={batchableActions}
                    customSelectCounterGenerator={this.customSelectCounterGenerator}
                    filters={this.filters}
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
            </div>
        );
    }
}

export const CertificateTable = connect((state: IStoreState, ownProps: IOwnProps): IStateProps => ({
    baseURL: getBaseURL(state),
    certificates: ownProps.certificates || getCertificates(state),
    configuration: getConfiguration(state),
    currentUser: getCurrentUser(state),
    producingAssets: getProducingAssets(state)
}))(CertificateTableClass);
