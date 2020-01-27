import { ProducingDevice } from '@energyweb/device-registry';
import { Certificate } from '@energyweb/origin';
import {
    Demand,
    PurchasableCertificate,
    MarketUser,
    Contracts as MarketContracts
} from '@energyweb/market';
import { MatchableDemand } from '@energyweb/market-matcher-core';
import { Configuration, TimeFrame } from '@energyweb/utils-general';
import { AddShoppingCart, AssignmentReturn, AssignmentTurnedIn, Publish } from '@material-ui/icons';
import moment from 'moment';
import React, { ReactNode } from 'react';
import { connect, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { BuyCertificateBulkModal } from './Modal/BuyCertificateBulkModal';
import { BuyCertificateModal } from './Modal/BuyCertificateModal';
import { PublishForSaleModal } from './Modal/PublishForSaleModal';
import { getBaseURL, getConfiguration, getProducingDevices } from '../features/selectors';
import { IStoreState } from '../types';
import { formatCurrency, formatDate, getDeviceLocationText, LOCATION_TITLE } from '../utils/helper';
import { NotificationType, showNotification } from '../utils/notifications';
import { getCertificateDetailLink } from '../utils/routing';
import { IBatchableAction } from './Table/ColumnBatchActions';
import { CustomFilterInputType, ICustomFilterDefinition } from './Table/FiltersHeader';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import {
    getInitialPaginatedLoaderFilteredSortedState,
    IPaginatedLoaderFilteredSortedState,
    PaginatedLoaderFilteredSorted
} from './Table/PaginatedLoaderFilteredSorted';
import { TableMaterial } from './Table/TableMaterial';
import { getUserById, getUsers, getCurrentUser } from '../features/users/selectors';
import { setLoading, TSetLoading } from '../features/general/actions';
import { getCertificates } from '../features/certificates/selectors';
import { getCurrencies, getOrganizationClient } from '../features/general/selectors';
import { ClaimCertificateBulkModal } from './Modal/ClaimCertificateBulkModal';
import { CircularProgress } from '@material-ui/core';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { IOrganizationClient } from '@energyweb/origin-backend-client';
import { IOrganization } from '@energyweb/origin-backend-core';

interface IOwnProps {
    certificates?: PurchasableCertificate.Entity[];
    demand?: Demand.Entity;
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IStateProps {
    certificates: PurchasableCertificate.Entity[];
    configuration: Configuration.Entity;
    producingDevices: ProducingDevice.Entity[];
    currentUser: MarketUser.Entity;
    users: MarketUser.Entity[];
    baseURL: string;
    organizationClient: IOrganizationClient;
}

interface IDispatchProps {
    setLoading: TSetLoading;
}

type Props = IOwnProps & IStateProps & IDispatchProps;

interface IEnrichedCertificateData {
    certificate: PurchasableCertificate.Entity;
    certificateOwner: MarketUser.Entity;
    producingDevice: ProducingDevice.Entity;
    currency: string;
    price: string;
    isOffChainSettlement: boolean;
    deviceTypeLabel: string;
    locationText: string;
    organization: IOrganization;
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
    buyModalForProducingDevice: ProducingDevice.Entity;
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

const CERTIFICATION_DATE_COLUMN = {
    id: 'certificationDate',
    label: 'Certification date',
    sortProperties: [
        (record: IEnrichedCertificateData) => record?.certificate?.certificate.creationTime
    ]
};

class CertificateTableClass extends PaginatedLoaderFilteredSorted<Props, ICertificatesState> {
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
            buyModalForProducingDevice: null,
            showBuyBulkModal: false,
            showClaimBulkModal: false,
            currentSort: CERTIFICATION_DATE_COLUMN,
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
                    currentUser?.id.toLowerCase() ===
                    enrichedCertificateData.certificate.certificate.owner.toLowerCase();
                const claimed =
                    Number(enrichedCertificateData.certificate.certificate.status) ===
                    Certificate.Status.Claimed;
                const forSale = enrichedCertificateData.certificate.forSale;
                const forDemand =
                    matchedCertificates?.find(
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
            const producingDevice =
                typeof certificate.certificate.deviceId !== 'undefined' &&
                this.props.producingDevices.find(
                    device => device.id === certificate.certificate.deviceId.toString()
                );

            const certificateOwner = getUserById(this.props.users, certificate.certificate.owner);

            const organization = await this.props.organizationClient.getById(
                certificateOwner?.information?.organization
            );

            enrichedData.push({
                certificate,
                producingDevice,
                deviceTypeLabel: producingDevice?.offChainProperties?.deviceType,
                certificateOwner,
                organization,
                price: certificate.isOffChainSettlement
                    ? formatCurrency(certificate.price / 100)
                    : certificate.price?.toString(),
                currency: certificate.isOffChainSettlement
                    ? certificate.currency
                    : await this.getTokenSymbol(certificate.currency),
                isOffChainSettlement: certificate.isOffChainSettlement,
                locationText: getDeviceLocationText(producingDevice)
            });
        }

        return enrichedData;
    }

    async initMatchingCertificates(demand: Demand.Entity) {
        const { certificates, configuration } = this.props;

        const matchableDemand = new MatchableDemand(demand);
        const find = async certificate => {
            const producingDevice = await new ProducingDevice.Entity(
                certificate.certificate.deviceId.toString(),
                configuration
            ).sync();
            const { result } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );
            return { result, certificate };
        };

        const matchedCertificates = (await Promise.all(certificates.map(find)))
            .filter(({ result }) => result)
            .map(({ certificate }) => certificate);

        this.setState({ matchedCertificates });
    }

    async getTokenSymbol(tokenAddress: string) {
        if (
            typeof tokenAddress === 'string' &&
            tokenAddress !== '0x0000000000000000000000000000000000000000'
        ) {
            const token = new MarketContracts.Erc20TestToken(
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

        const device: ProducingDevice.Entity = this.props.producingDevices.find(
            (a: ProducingDevice.Entity) => a.id === certificate.certificate.deviceId.toString()
        );

        this.setState({
            buyModalForCertificate: certificate,
            buyModalForProducingDevice: device,
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
            let device = this.props.producingDevices.find(
                a => a.id === certificate.certificate.deviceId.toString()
            );
            if (!device) {
                device = await new ProducingDevice.Entity(
                    certificate.certificate.deviceId.toString(),
                    this.props.configuration
                ).sync();
            }

            const currencies = useSelector(getCurrencies);

            const offChainProperties: Demand.IDemandOffChainProperties = {
                timeFrame: TimeFrame.yearly,
                maxPriceInCentsPerMwh: 0,
                currency: currencies[0],
                otherGreenAttributes: device.offChainProperties.otherGreenAttributes,
                typeOfPublicSupport: device.offChainProperties.typeOfPublicSupport,
                energyPerTimeFrame: certificate.certificate.energy,
                registryCompliance: device.offChainProperties.complianceRegistry,
                startTime: 0,
                endTime: 0,
                automaticMatching: true
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

        const maxCertificateEnergyInDisplayUnit = EnergyFormatter.getValueInDisplayUnit(
            this.props.certificates.reduce(
                (a, b) => (b.certificate.energy > a ? b.certificate.energy : a),
                0
            )
        );

        const filters: ICustomFilterDefinition[] = [
            {
                property: (record: IEnrichedCertificateData) => `${record?.locationText}`,
                label: `Search by ${LOCATION_TITLE.toLowerCase()}`,
                input: {
                    type: CustomFilterInputType.string
                },
                search: true
            },
            {
                property: (record: IEnrichedCertificateData) =>
                    record?.producingDevice?.offChainProperties?.deviceType,
                label: 'Device type',
                input: {
                    type: CustomFilterInputType.deviceType,
                    defaultOptions: []
                }
            },
            {
                property: (record: IEnrichedCertificateData) =>
                    moment
                        .unix(record?.producingDevice?.offChainProperties?.operationalSince)
                        .year()
                        .toString(),
                label: 'Commissioning date',
                input: {
                    type: CustomFilterInputType.dropdown,
                    availableOptions: new Array(40).fill(moment().year()).map((item, index) => ({
                        label: (item - index).toString(),
                        value: item - index
                    }))
                }
            },
            {
                property: (record: IEnrichedCertificateData) => record?.locationText,
                label: LOCATION_TITLE,
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: (record: IEnrichedCertificateData) => record?.organization?.name,
                label: 'Owner',
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: (record: IEnrichedCertificateData) =>
                    record?.certificate?.certificate?.creationTime?.toString(),
                label: 'Certification date',
                input: {
                    type: CustomFilterInputType.yearMonth
                }
            },
            {
                property: (record: IEnrichedCertificateData): number =>
                    EnergyFormatter.getValueInDisplayUnit(record?.certificate?.certificate?.energy),
                label: `Certified energy (${EnergyFormatter.displayUnit})`,
                input: {
                    type: CustomFilterInputType.slider,
                    min: 0,
                    max: maxCertificateEnergyInDisplayUnit
                }
            }
        ];

        return filters.filter(filter => !this.hiddenColumns.includes(filter.label));
    }

    hideBuyModal() {
        if (this.isMountedIndicator) {
            this.setState({
                showBuyModal: false,
                buyModalForCertificate: null,
                buyModalForProducingDevice: null
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

            const energy = selectedCertificates.reduce((a, b) => a + b.certificate.energy, 0);

            return `${selectedIndexes.length} selected (${EnergyFormatter.format(energy, true)})`;
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
            {
                id: 'deviceType',
                label: 'Device type',
                sortProperties: [(record: IEnrichedCertificateData) => record?.deviceTypeLabel]
            },
            {
                id: 'commissioningDate',
                label: 'Commissioning date',
                sortProperties: [
                    (record: IEnrichedCertificateData) =>
                        record?.producingDevice?.offChainProperties?.operationalSince
                ]
            },
            {
                id: 'locationText',
                label: LOCATION_TITLE,
                sortProperties: [(record: IEnrichedCertificateData) => record?.locationText]
            },
            { id: 'compliance', label: 'Compliance' },
            {
                id: 'owner',
                label: 'Owner',
                sortProperties: [(record: IEnrichedCertificateData) => record?.organization?.name]
            },
            CERTIFICATION_DATE_COLUMN,
            { id: 'price', label: 'Price' },
            { id: 'currency', label: 'Currency' },
            {
                id: 'energy',
                label: `Certified energy (${EnergyFormatter.displayUnit})`,
                sortProperties: [
                    [
                        (record: IEnrichedCertificateData) =>
                            record?.certificate?.certificate?.energy,
                        (value: number) => value
                    ]
                ]
            }
        ] as const).filter(column => !this.hiddenColumns.includes(column.id));
    }

    get rows() {
        return this.state.paginatedData.map(enrichedData => {
            let deviceType = '';
            let commissioningDate = '';
            let compliance = '';

            if (enrichedData.producingDevice?.offChainProperties) {
                deviceType = this.deviceTypeService.getDisplayText(
                    enrichedData.producingDevice.offChainProperties.deviceType
                );

                commissioningDate = formatDate(
                    moment.unix(enrichedData.producingDevice.offChainProperties.operationalSince)
                );

                compliance = enrichedData.producingDevice.offChainProperties.complianceRegistry;
            }

            let price: string | ReactNode = enrichedData.price;
            let currency = enrichedData.currency;

            if (price === '0.00' && currency === 'NONE') {
                price = <CircularProgress />;
                currency = '';
            }

            return {
                deviceType,
                commissioningDate,
                locationText: getDeviceLocationText(enrichedData.producingDevice),
                compliance,
                owner: enrichedData?.organization?.name,
                certificationDate: formatDate(
                    moment.unix(enrichedData.certificate.certificate.creationTime)
                ),
                price,
                currency,
                energy: EnergyFormatter.format(enrichedData.certificate.certificate.energy)
            };
        });
    }

    render() {
        const {
            buyModalForCertificate,
            buyModalForProducingDevice,
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
                    producingDevice={
                        this.state.sellModalForCertificate
                            ? this.props.producingDevices.find(
                                  (device: ProducingDevice.Entity) =>
                                      device.id ===
                                      sellModalForCertificate.certificate.deviceId.toString()
                              )
                            : null
                    }
                    showModal={showSellModal}
                    callback={this.hidePublishForSaleModal}
                />

                <BuyCertificateModal
                    certificate={buyModalForCertificate}
                    producingDevice={buyModalForProducingDevice}
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
        producingDevices: getProducingDevices(state),
        users: getUsers(state),
        organizationClient: getOrganizationClient(state)
    }),
    dispatchProps
)(CertificateTableClass);
