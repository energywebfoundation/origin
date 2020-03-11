import { ProducingDevice } from '@energyweb/device-registry';
import { Certificate } from '@energyweb/issuer';
import { MarketUser } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';
import { AssignmentTurnedIn } from '@material-ui/icons';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { IOrganizationClient } from '@energyweb/origin-backend-client';

import { getBaseURL, getConfiguration, getProducingDevices } from '../features/selectors';
import { IStoreState } from '../types';
import { getDeviceLocationText, LOCATION_TITLE_TRANSLATION_KEY } from '../utils/helper';
import { formatDate } from '../utils/time';
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
import { getUsers, getCurrentUser } from '../features/users/selectors';
import { setLoading, TSetLoading } from '../features/general/actions';
import { getCertificates } from '../features/certificates/selectors';
import { getOffChainDataSource } from '../features/general/selectors';
import { ClaimCertificateBulkModal } from './Modal/ClaimCertificateBulkModal';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { withTranslation, WithTranslation } from 'react-i18next';
import { checkRecordPassesFilters } from './Table/PaginatedLoaderFiltered';

interface IOwnProps {
    certificates?: Certificate.Entity[];
    // demand?: Demand.Entity;
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IStateProps {
    certificates: Certificate.Entity[];
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

type Props = IOwnProps & IStateProps & IDispatchProps & WithTranslation;

interface IEnrichedCertificateData {
    certificate: Certificate.Entity;
    producingDevice: ProducingDevice.Entity;
    deviceTypeLabel: string;
    locationText: string;
}

interface ICertificatesState extends IPaginatedLoaderFilteredSortedState {
    selectedState: SelectedState;
    selectedCertificates: Certificate.Entity[];
    detailViewForCertificateId: string;
    showClaimBulkModal: boolean;
    paginatedData: IEnrichedCertificateData[];
}

export enum SelectedState {
    Inbox,
    Claimed
}

const CERTIFICATION_DATE_COLUMN_ID = 'certificationDate';
const CERTIFICATION_DATE_COLUMN_SORT_PROPERTIES = [
    (record: IEnrichedCertificateData) => record?.certificate?.creationTime
];

class CertificateTableClass extends PaginatedLoaderFilteredSorted<Props, ICertificatesState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredSortedState(),
            selectedState: SelectedState.Inbox,
            selectedCertificates: [],
            detailViewForCertificateId: null,
            showClaimBulkModal: false,
            currentSort: {
                id: CERTIFICATION_DATE_COLUMN_ID,
                sortProperties: CERTIFICATION_DATE_COLUMN_SORT_PROPERTIES
            },
            sortAscending: false
        };

        this.claimCertificateBulk = this.claimCertificateBulk.bind(this);
        this.hideClaimBulkModal = this.hideClaimBulkModal.bind(this);
        this.customSelectCounterGenerator = this.customSelectCounterGenerator.bind(this);
    }

    get deviceTypeService() {
        return this.props.configuration?.deviceTypeService;
    }

    async componentDidMount() {
        await super.componentDidMount();
    }

    async componentDidUpdate(prevProps: Props) {
        if (
            prevProps.certificates !== this.props.certificates ||
            prevProps.users.length !== this.props.users.length
        ) {
            await this.loadPage(1);
        }
    }

    async getPaginatedData({
        pageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const { currentUser, selectedState, certificates } = this.props;

        const enrichedData = await this.enrichData(certificates);

        const filteredIEnrichedCertificateData = enrichedData.filter(
            (enrichedCertificateData: IEnrichedCertificateData) => {
                const ownerOf = enrichedCertificateData.certificate.isOwned(
                    currentUser?.id.toLowerCase()
                );
                const claimed = enrichedCertificateData.certificate.isClaimed(
                    currentUser?.id.toLowerCase()
                );

                return (
                    checkRecordPassesFilters(
                        enrichedCertificateData,
                        requestedFilters,
                        this.deviceTypeService
                    ) &&
                    ((ownerOf && selectedState === SelectedState.Inbox) ||
                        (claimed && selectedState === SelectedState.Claimed))
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
        const enrichedData: IEnrichedCertificateData[] = [];

        for (const certificate of certificates) {
            const producingDevice =
                typeof certificate.deviceId !== 'undefined' &&
                this.props.producingDevices.find(
                    device => device.id === certificate.deviceId.toString()
                );

            enrichedData.push({
                certificate,
                producingDevice,
                deviceTypeLabel: producingDevice?.offChainProperties?.deviceType,
                locationText: getDeviceLocationText(producingDevice)
            });
        }

        return enrichedData;
    }

    async claimCertificateBulk(selectedIndexes) {
        const { t } = this.props;

        if (selectedIndexes.length === 0) {
            showNotification(t('certificate.feedback.zeroSelected'), NotificationType.Error);

            return;
        }

        const CERTIFICATE_LIMIT = 100;

        if (selectedIndexes.length > CERTIFICATE_LIMIT) {
            showNotification(
                t(`certificate.feedback.pleaseSelectLess`, { amount: CERTIFICATE_LIMIT }),
                NotificationType.Error
            );

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

    async claimCertificate(rowIndex: number) {
        const certificateId = this.state.paginatedData[rowIndex].certificate.id;
        const { t } = this.props;

        const certificate: Certificate.Entity = this.props.certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        console.log({
            action: 'claim',
            certificate
        });

        if (
            certificate &&
            this.props.currentUser &&
            certificate.isOwned(this.props.currentUser.id)
        ) {
            this.props.setLoading(true);
            await certificate.claim();
            this.props.setLoading(false);
            showNotification(
                t('certificate.feedback.claimed', { id: certificate.id }),
                NotificationType.Success
            );
        }
    }

    showCertificateDetails(rowIndex: number) {
        this.setState({
            detailViewForCertificateId: this.state.paginatedData[rowIndex].certificate.id
        });
    }

    get filters(): ICustomFilterDefinition[] {
        if (![SelectedState.Claimed].includes(this.props.selectedState)) {
            return [];
        }

        const { t } = this.props;

        const maxCertificateEnergyInDisplayUnit = EnergyFormatter.getValueInDisplayUnit(
            this.props.certificates.reduce((a, b) => (b.energy > a ? b.energy : a), 0)
        );

        const filters: ICustomFilterDefinition[] = [
            {
                property: (record: IEnrichedCertificateData) => `${record?.locationText}`,
                label: t('search.searchByRegionProvince'),
                input: {
                    type: CustomFilterInputType.string
                },
                search: true
            },
            {
                property: (record: IEnrichedCertificateData) =>
                    record?.producingDevice?.offChainProperties?.deviceType,
                label: t('certificate.properties.deviceType'),
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
                label: t('device.properties.commissioningDate'),
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
                label: t(LOCATION_TITLE_TRANSLATION_KEY),
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: (record: IEnrichedCertificateData) =>
                    record?.certificate?.creationTime?.toString(),
                label: t('certificate.properties.certificationDate'),
                input: {
                    type: CustomFilterInputType.yearMonth
                }
            },
            {
                property: (record: IEnrichedCertificateData): number =>
                    EnergyFormatter.getValueInDisplayUnit(record?.certificate?.energy),
                label: `${t('certificate.properties.certifiedEnergy')} (${
                    EnergyFormatter.displayUnit
                })`,
                input: {
                    type: CustomFilterInputType.slider,
                    min: 0,
                    max: maxCertificateEnergyInDisplayUnit
                }
            }
        ];

        return filters.filter(filter => !this.hiddenColumns.includes(filter.label));
    }

    hideClaimBulkModal() {
        this.setState({
            showClaimBulkModal: false
        });
    }

    customSelectCounterGenerator(selectedIndexes: number[]) {
        if (selectedIndexes.length > 0) {
            const { t } = this.props;

            const selectedCertificates = this.state.paginatedData
                .filter((item, index) => selectedIndexes.includes(index))
                .map(i => i.certificate);

            const energy = selectedCertificates.reduce((a, b) => a + b.energy, 0);

            return `${t('certificate.feedback.amountSelected', {
                amount: selectedIndexes.length
            })} (${EnergyFormatter.format(energy, true)})`;
        }
    }

    get batchableActions(): IBatchableAction[] {
        const actions = [];
        const { t } = this.props;

        if (this.props.selectedState === SelectedState.Inbox) {
            actions.push({
                label: t('certificate.actions.claim'),
                handler: this.claimCertificateBulk
            });
        }

        return actions;
    }

    get actions() {
        const { t } = this.props;
        const actions = [];

        switch (this.props.selectedState) {
            case SelectedState.Inbox:
                actions.push({
                    name: t('certificate.actions.claim'),
                    icon: <AssignmentTurnedIn />,
                    onClick: (row: number) => this.claimCertificate(row)
                });
                break;
        }

        return actions;
    }

    get hiddenColumns() {
        const hiddenColumns = this.props.hiddenColumns || [];

        return hiddenColumns;
    }

    get columns() {
        const { t } = this.props;

        return ([
            {
                id: 'deviceType',
                label: t('certificate.properties.deviceType'),
                sortProperties: [(record: IEnrichedCertificateData) => record?.deviceTypeLabel]
            },
            {
                id: 'commissioningDate',
                label: t('device.properties.commissioningDate'),
                sortProperties: [
                    (record: IEnrichedCertificateData) =>
                        record?.producingDevice?.offChainProperties?.operationalSince
                ]
            },
            {
                id: 'locationText',
                label: t(LOCATION_TITLE_TRANSLATION_KEY),
                sortProperties: [(record: IEnrichedCertificateData) => record?.locationText]
            },
            { id: 'compliance', label: t('certificate.properties.compliance') },
            {
                id: CERTIFICATION_DATE_COLUMN_ID,
                label: t('certificate.properties.certificationDate'),
                sortProperties: CERTIFICATION_DATE_COLUMN_SORT_PROPERTIES
            },
            {
                id: 'energy',
                label: `${t('certificate.properties.certifiedEnergy')} (${
                    EnergyFormatter.displayUnit
                })`,
                sortProperties: [
                    [
                        (record: IEnrichedCertificateData) => record?.certificate?.ownedVolume(),
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
                deviceType = this.deviceTypeService?.getDisplayText(
                    enrichedData.producingDevice.offChainProperties.deviceType
                );

                commissioningDate = formatDate(
                    moment.unix(enrichedData.producingDevice.offChainProperties.operationalSince)
                );

                compliance = enrichedData.producingDevice.offChainProperties.complianceRegistry;
            }

            return {
                deviceType,
                commissioningDate,
                locationText: getDeviceLocationText(enrichedData.producingDevice),
                compliance,
                certificationDate: formatDate(moment.unix(enrichedData.certificate.creationTime)),
                energy: EnergyFormatter.format(enrichedData.certificate.energy)
            };
        });
    }

    render() {
        const {
            currentSort,
            detailViewForCertificateId,
            pageSize,
            selectedCertificates,
            showClaimBulkModal,
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

export const CertificateTable = withTranslation()(
    connect(
        (state: IStoreState, ownProps: IOwnProps): IStateProps => ({
            baseURL: getBaseURL(),
            certificates: ownProps.certificates || getCertificates(state),
            configuration: getConfiguration(state),
            currentUser: getCurrentUser(state),
            producingDevices: getProducingDevices(state),
            users: getUsers(state),
            organizationClient: getOffChainDataSource(state)?.organizationClient
        }),
        dispatchProps
    )(CertificateTableClass)
);
