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

import { Certificate, TradableEntity } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';
import { Configuration, TimeFrame, Currency } from 'ew-utils-general-lib';
import { MatcherLogic } from 'ew-market-matcher';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { showNotification, NotificationType } from '../utils/notifications';
import { PublishForSaleModal } from '../elements/Modal/PublishForSaleModal';
import { BuyCertificateModal } from '../elements/Modal/BuyCertificateModal';
import { Erc20TestToken } from 'ew-erc-test-contracts';
import { PaginatedLoader, DEFAULT_PAGE_SIZE, IPaginatedLoaderState, IPaginatedLoaderFetchDataParameters, IPaginatedLoaderFetchDataReturnValues } from '../elements/Table/PaginatedLoader';

export interface ICertificateTableProps {
    conf: Configuration.Entity;
    certificates: Certificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: User;
    baseUrl: string;
    selectedState: SelectedState;
    switchedToOrganization: boolean;
    demand?: Demand.Entity;
}

export interface IEnrichedCertificateData {
    certificate: Certificate.Entity;
    certificateOwner: User;
    producingAsset: ProducingAsset.Entity;
    acceptedCurrency: string;
    offChainSettlementOptions: TradableEntity.IOffChainSettlementOptions;
    isOffChainSettlement: boolean;
}

export interface ICertificatesState extends IPaginatedLoaderState {
    selectedState: SelectedState;
    detailViewForCertificateId: number;
    matchedCertificates: Certificate.Entity[];
    shouldShowPrice: boolean;
    showSellModal: boolean;
    sellModalForCertificate: Certificate.Entity;
    showBuyModal: boolean;
    buyModalForCertificate: Certificate.Entity;
    buyModalForProducingAsset: ProducingAsset.Entity;
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

export class CertificateTable extends PaginatedLoader<ICertificateTableProps, ICertificatesState> {
    constructor(props: ICertificateTableProps) {
        super(props);

        this.state = {
            data: [],
            selectedState: SelectedState.Inbox,
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
            pageSize: DEFAULT_PAGE_SIZE,
            total: 0
        };

        this.publishForSale = this.publishForSale.bind(this);
        this.claimCertificate = this.claimCertificate.bind(this);
        this.operationClicked = this.operationClicked.bind(this);
        this.showTxClaimed = this.showTxClaimed.bind(this);
        this.showCertCreated = this.showCertCreated.bind(this);
        this.showCertificateDetails = this.showCertificateDetails.bind(this);
        this.getTokenSymbol = this.getTokenSymbol.bind(this);
        this.hidePublishForSaleModal = this.hidePublishForSaleModal.bind(this);
        this.hideBuyModal = this.hideBuyModal.bind(this);
    }

    async componentDidMount() {
        if (this.props.selectedState === SelectedState.ForDemand && this.props.demand) {
            await this.initMatchingCertificates(this.props.demand);
        }

        await super.componentDidMount();
    }

    async componentDidUpdate(newProps: ICertificateTableProps) {
        if (newProps.certificates !== this.props.certificates) {
            await this.loadPage(1);
        }
    }

    async getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedData = await this.enrichData(this.props.certificates);

        const filteredIEnrichedCertificateData = enrichedData.filter(
            (EnrichedCertificateData: IEnrichedCertificateData) => {
                const ownerOf = this.props.currentUser && this.props.currentUser.id === EnrichedCertificateData.certificate.owner;
                const claimed = Number(EnrichedCertificateData.certificate.status) === Certificate.Status.Retired;
                const forSale = EnrichedCertificateData.certificate.forSale;
                const forDemand = this.state.matchedCertificates.find(cert => cert.id === EnrichedCertificateData.certificate.id) !== undefined;
                const isActive = Number(EnrichedCertificateData.certificate.status) === Certificate.Status.Active;

                if (
                    this.props.switchedToOrganization &&
                    EnrichedCertificateData.certificate.owner.toLowerCase() !== this.props.currentUser.id.toLowerCase()
                ) {
                    return false;
                }

                return (
                    (isActive && ownerOf && !forSale && this.props.selectedState === SelectedState.Inbox) ||
                    (claimed && this.props.selectedState === SelectedState.Claimed) ||
                    (isActive && forSale && this.props.selectedState === SelectedState.ForSale) ||
                    (isActive && forSale && forDemand && this.props.selectedState === SelectedState.ForDemand)
                );
            }
        );

        const certificates = filteredIEnrichedCertificateData.slice(offset, offset + pageSize);
        const total = filteredIEnrichedCertificateData.length;

        const data = certificates.map(
            (EnrichedCertificateData: IEnrichedCertificateData) => {
                const certificate = EnrichedCertificateData.certificate;

                const certificateDataToShow = [
                    certificate.id,
                    ProducingAsset.Type[
                        EnrichedCertificateData.producingAsset.offChainProperties.assetType
                    ],
                    moment(
                        EnrichedCertificateData.producingAsset.offChainProperties.operationalSince *
                            1000
                    ,   'x').format('MMM YY'),
                    `${EnrichedCertificateData.producingAsset.offChainProperties.city}, ${
                        EnrichedCertificateData.producingAsset.offChainProperties.country
                    }`,
                    ProducingAsset.Compliance[
                        EnrichedCertificateData.producingAsset.offChainProperties.complianceRegistry
                    ],
                    EnrichedCertificateData.certificateOwner.organization,
                    new Date(
                        EnrichedCertificateData.certificate.creationTime * 1000
                    ).toDateString(),
                    EnrichedCertificateData.certificate.powerInW / 1000
                ];

                if (this.state.shouldShowPrice) {
                    const formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    });

                    certificateDataToShow.splice(7, 0,
                        EnrichedCertificateData.isOffChainSettlement 
                            ? formatter.format(EnrichedCertificateData.offChainSettlementOptions.price / 100).replace('$', '')
                            : EnrichedCertificateData.certificate.onChainDirectPurchasePrice
                    );
                    certificateDataToShow.splice(8, 0, EnrichedCertificateData.acceptedCurrency);
                }

                return certificateDataToShow;
            }
        );

        return {
            data,
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

            enrichedData.push({
                certificate,
                producingAsset: this.props.producingAssets.find(
                    (asset: ProducingAsset.Entity) => asset.id === certificate.assetId.toString()
                ),
                certificateOwner: await new User(certificate.owner, this.props.conf as any).sync(),
                offChainSettlementOptions,
                acceptedCurrency,
                isOffChainSettlement
            });
        }

        return enrichedData;
    }

    async initMatchingCertificates(demand: Demand.Entity) {
        const matchedCertificates: Certificate.Entity[] = await MatcherLogic.findMatchingCertificatesForDemand(demand, this.props.conf, this.props.certificates);

        this.setState({ matchedCertificates });
    }

    async getTokenSymbol(certificate) {
        if (certificate.acceptedToken
            && certificate.acceptedToken !== '0x0000000000000000000000000000000000000000') {
            const token = new Erc20TestToken(
                this.props.conf.blockchainProperties.web3,
                (certificate.acceptedToken as any) as string
            );
            const symbol = await token.web3Contract.methods.symbol().call();

            return symbol;
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

    async publishForSale(certificateId: number) {
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate.forSale) {
            showNotification(`Certificate ${certificate.id} has already been published for sale.`, NotificationType.Error);

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
            showNotification(`You are not the owner of certificate ${certificate.id}.`, NotificationType.Error);

            return;
        }
        if (!certificate.forSale) {
            showNotification(`Certificate ${certificate.id} is already in Inbox.`, NotificationType.Error);

            return;
        }

        certificate.configuration.blockchainProperties.activeUser = {
            address: this.props.currentUser.id
        };

        await certificate.unpublishForSale();
        showNotification(`Certificate ${certificate.id} has been returned to Inbox.`, NotificationType.Success);
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
            showNotification(`Certificate ${certificate.id} has been claimed.`, NotificationType.Success);
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
                    this.props.conf
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
                url: ''
            };

            await Demand.createDemand(
                onChainProperties,
                offChainProperties,
                this.props.conf
            );
        }
    }

    showCertificateDetails(certificateId: number) {
        this.setState({
            detailViewForCertificateId: certificateId
        });
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

    render() {
        if (this.state.detailViewForCertificateId !== null) {
            return (
                <Redirect
                    push={true}
                    to={`/${this.props.baseUrl}/certificates/detail_view/${this.state.detailViewForCertificateId}`}
                />
            );
        }

        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableHeader = [
            generateHeader('#', 60),
            generateHeader('Asset Type'),
            generateHeader('Commissioning Date'),
            generateHeader('Town, Country'),
            // generateHeader('Max Capacity (kWh)', defaultWidth, true),
            generateHeader('Compliance'),
            generateHeader('Owner'),
            generateHeader('Certification Date'),
            generateHeader('Certified Energy (kWh)', defaultWidth, true, true)
        ];

        if (this.state.shouldShowPrice) {
            TableHeader.splice(7, 0, generateHeader('Price'));
            TableHeader.splice(8, 0, generateHeader('Currency'));
        }

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: TableHeader.length - 1
            },
            generateFooter('Certified Energy (kWh)', true)
        ];

        const operations = [];

        switch (this.props.selectedState) {
            case SelectedState.Inbox:
                operations.push(
                    OPERATIONS.CLAIM,
                    OPERATIONS.PUBLISH_FOR_SALE
                );
                break;
            case SelectedState.ForSale:
                operations.push(
                    OPERATIONS.BUY,
                    OPERATIONS.RETURN_TO_INBOX
                );
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
                <Table
                    operationClicked={this.operationClicked}
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    data={this.state.data}
                    actionWidth={55.39}
                    operations={operations}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                />

                <PublishForSaleModal
                    conf={this.props.conf}
                    certificate={this.state.sellModalForCertificate}
                    producingAsset={
                        this.state.sellModalForCertificate ?
                            this.props.producingAssets.find(
                                (asset: ProducingAsset.Entity) => asset.id === this.state.sellModalForCertificate.assetId.toString()
                            )
                            : null
                    }
                    showModal={this.state.showSellModal}
                    callback={this.hidePublishForSaleModal}
                />

                <BuyCertificateModal
                    conf={this.props.conf}
                    certificate={this.state.buyModalForCertificate}
                    producingAsset={this.state.buyModalForProducingAsset}
                    showModal={this.state.showBuyModal}
                    callback={this.hideBuyModal}
                />
            </div>
        );
    }
}
