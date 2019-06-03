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

import { Certificate } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';
import { Erc20TestToken } from 'ew-erc-test-contracts';
import { Configuration, TimeFrame, Currency } from 'ew-utils-general-lib';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';

export interface ICertificateTableProps {
    conf: Configuration.Entity;
    certificates: Certificate.Entity[];
    producingAssets: ProducingAsset.Entity[];
    currentUser: User;
    baseUrl: string;
    selectedState: SelectedState;
    switchedToOrganization: boolean;
}

export interface IEnrichedCertificateData {
    certificate: Certificate.Entity;
    certificateOwner: User;
    producingAsset: ProducingAsset.Entity;
}

export interface ICertificatesState {
    EnrichedCertificateData: IEnrichedCertificateData[];
    selectedState: SelectedState;
    detailViewForCertificateId: number;
}

export enum SelectedState {
    Claimed,
    Sold,
    ForSale,
    ForSaleERC20
}

export class CertificateTable extends React.Component<ICertificateTableProps, ICertificatesState> {
    constructor(props: ICertificateTableProps) {
        super(props);

        this.state = {
            EnrichedCertificateData: [],
            selectedState: SelectedState.Claimed,
            detailViewForCertificateId: null
        };

        this.claimCertificate = this.claimCertificate.bind(this);
        this.operationClicked = this.operationClicked.bind(this);
        this.showTxClaimed = this.showTxClaimed.bind(this);
        this.showCertCreated = this.showCertCreated.bind(this);
        this.showCertificateDetails = this.showCertificateDetails.bind(this);
    }

    async componentDidMount() {
        await this.enrichData(this.props);
    }

    async componentWillReceiveProps(newProps: ICertificateTableProps) {
        await this.enrichData(newProps);
    }

    async enrichData(props: ICertificateTableProps) {
        const promieses = props.certificates.map(async (certificate: Certificate.Entity) => ({
            certificate,
            producingAsset: this.props.producingAssets.find(
                (asset: ProducingAsset.Entity) => asset.id === certificate.assetId.toString()
            ),
            certificateOwner: await new User(certificate.owner, props.conf as any).sync()
        }));

        Promise.all(promieses).then(EnrichedCertificateData => {
            this.setState({
                EnrichedCertificateData
            });
        });
    }

    async buyCertificate(certificateId: number) {
        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        if (certificate && this.props.currentUser) {
            const erc20TestToken = new Erc20TestToken(
                this.props.conf.blockchainProperties.web3,
                (certificate.acceptedToken as any) as string
            );
            await erc20TestToken.approve(
                certificate.owner,
                certificate.onCHainDirectPurchasePrice,
                {
                    from: this.props.currentUser.id,
                    privateKey: ''
                }
            );

            certificate.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };
            await certificate.buyCertificate();
        }
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
                pricePerCertifiedWh: 0,
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
            case 'Claim':
                this.claimCertificate(id);
                break;
            case 'Buy':
                await this.buyCertificate(id);
                break;
            case 'Show Claiming Tx':
                this.showTxClaimed(id);
                break;
            case 'Show Certificate Creation Tx':
                this.showCertCreated(id);
                break;
            case 'Show Initial Logging Transaction':
                // this.showInitialLoggingTx(id);
                break;
            case 'Show Certificate Details':
                this.showCertificateDetails(id);
                break;
            default:
        }
    }

    render() {
        if (this.state.detailViewForCertificateId !== null) {
            return (
                <Redirect
                    push
                    to={
                        '/' +
                        this.props.baseUrl +
                        '/certificates/detail_view/' +
                        this.state.detailViewForCertificateId
                    }
                />
            );
        }

        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 7
            },
            generateFooter('Certified Energy (kWh)', true)
        ];

        const filteredIEnrichedCertificateData = this.state.EnrichedCertificateData.filter(
            (EnrichedCertificateData: IEnrichedCertificateData) => {
                const claimed =
                    EnrichedCertificateData.certificate.status === Certificate.Status.Retired;
                const forSale =
                    EnrichedCertificateData.certificate.owner ===
                    EnrichedCertificateData.producingAsset.owner.address;
                const forSaleERC20 =
                    EnrichedCertificateData.certificate.acceptedToken &&
                    this.props.conf.blockchainProperties.web3.utils
                        .toBN(EnrichedCertificateData.certificate.acceptedToken)
                        .toString() !== '0' &&
                    EnrichedCertificateData.certificate.onCHainDirectPurchasePrice > 0 &&
                    this.props.currentUser &&
                    EnrichedCertificateData.certificateOwner.id !== this.props.currentUser.id;

                if (
                    this.props.switchedToOrganization &&
                    EnrichedCertificateData.certificate.owner !== this.props.currentUser.id
                ) {
                    return false;
                }

                return (
                    (claimed && this.props.selectedState === SelectedState.Claimed) ||
                    (!claimed && forSale && this.props.selectedState === SelectedState.ForSale) ||
                    (!claimed && !forSale && this.props.selectedState === SelectedState.Sold) ||
                    (!claimed &&
                        forSaleERC20 &&
                        this.props.selectedState === SelectedState.ForSaleERC20)
                );
            }
        );

        const data = filteredIEnrichedCertificateData.map(
            (EnrichedCertificateData: IEnrichedCertificateData) => {
                const certificate = EnrichedCertificateData.certificate;

                return [
                    certificate.id,
                    ProducingAsset.Type[
                        EnrichedCertificateData.producingAsset.offChainProperties.assetType
                    ],
                    moment(
                        EnrichedCertificateData.producingAsset.offChainProperties.operationalSince *
                            1000
                    , 'x').format('MMM YY'),
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
            }
        );

        let TableHeader = [
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

        const operations = [
            'Show Certificate Creation Tx',
            'Show Initial Logging Transaction',
            'Show Certificate Details'
        ].concat(
            this.props.selectedState === SelectedState.Sold
                ? ['Claim']
                : this.props.selectedState === SelectedState.ForSaleERC20
                ? ['Buy']
                : []
        );
        if (this.props.selectedState === SelectedState.Claimed) {
            operations.concat(['Show Claiming Tx']);
        }

        return (
            <div className="ForSaleWrapper">
                <Table
                    operationClicked={this.operationClicked}
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    data={data}
                    actionWidth={55.39}
                    operations={operations}
                />
            </div>
        );
    }
}
