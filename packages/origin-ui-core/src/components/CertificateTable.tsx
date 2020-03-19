import { ProducingDevice } from '@energyweb/device-registry';
import { Certificate } from '@energyweb/issuer';
import { AssignmentTurnedIn } from '@material-ui/icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { getConfiguration, getProducingDevices } from '../features/selectors';
import {
    EnergyFormatter,
    getDeviceLocationText,
    LOCATION_TITLE_TRANSLATION_KEY,
    useLinks,
    formatDate,
    NotificationType,
    showNotification,
    useTranslation
} from '../utils';

import { IBatchableAction } from './Table/ColumnBatchActions';
import { CustomFilterInputType, ICustomFilterDefinition } from './Table/FiltersHeader';
import { IPaginatedLoaderFetchDataReturnValues } from './Table/PaginatedLoader';
import { TableMaterial } from './Table/TableMaterial';
import { getUserOffchain } from '../features/users/selectors';
import { setLoading } from '../features/general/actions';
import { getCertificates } from '../features/certificates/selectors';
import { ClaimCertificateBulkModal } from './Modal/ClaimCertificateBulkModal';
import {
    usePaginatedLoaderSorting,
    checkRecordPassesFilters,
    usePaginatedLoaderFiltered,
    IPaginatedLoaderHooksFetchDataParameters
} from './Table';

interface IProps {
    certificates?: Certificate.Entity[];
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IEnrichedCertificateData {
    certificate: Certificate.Entity;
    producingDevice: ProducingDevice.Entity;
    deviceTypeLabel: string;
    locationText: string;
}

export enum SelectedState {
    Inbox,
    Claimed
}

const CERTIFICATION_DATE_COLUMN_ID = 'certificationDate';
const CERTIFICATION_DATE_COLUMN_SORT_PROPERTIES = [
    (record: IEnrichedCertificateData) => record?.certificate?.creationTime
];

export function CertificateTable(props: IProps) {
    const { currentSort, sortAscending, sortData, toggleSort } = usePaginatedLoaderSorting({
        currentSort: {
            id: CERTIFICATION_DATE_COLUMN_ID,
            sortProperties: CERTIFICATION_DATE_COLUMN_SORT_PROPERTIES
        },
        sortAscending: false
    });

    const stateCertificates = useSelector(getCertificates);
    const configuration = useSelector(getConfiguration);
    const user = useSelector(getUserOffchain);
    const producingDevices = useSelector(getProducingDevices);

    const { selectedState } = props;
    const hiddenColumns = props.hiddenColumns || [];
    const certificates = props.certificates || stateCertificates;
    const deviceTypeService = configuration?.deviceTypeService;
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { getCertificateDetailLink } = useLinks();

    const [selectedCertificates, setSelectedCertificates] = useState<Certificate.Entity[]>([]);
    const [detailViewForCertificateId, setDetailViewForCertificateId] = useState<string>(null);
    const [showClaimBulkModal, setShowClaimBulkModal] = useState(false);

    const userAddress = user?.blockchainAccountAddress?.toLowerCase();

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedData: IEnrichedCertificateData[] = certificates.map(certificate => {
            const producingDevice =
                typeof certificate.deviceId !== 'undefined' &&
                producingDevices.find(
                    device => device.id?.toString() === certificate.deviceId.toString()
                );

            return {
                certificate,
                producingDevice,
                deviceTypeLabel: producingDevice?.deviceType,
                locationText: getDeviceLocationText(producingDevice)
            };
        });

        const filteredIEnrichedCertificateData = enrichedData.filter(
            (enrichedCertificateData: IEnrichedCertificateData) => {
                const ownerOf = enrichedCertificateData.certificate.isOwned(userAddress);
                const claimed = enrichedCertificateData.certificate.isClaimed(userAddress);

                return (
                    checkRecordPassesFilters(
                        enrichedCertificateData,
                        requestedFilters,
                        deviceTypeService
                    ) &&
                    ((ownerOf && selectedState === SelectedState.Inbox) ||
                        (claimed && selectedState === SelectedState.Claimed))
                );
            }
        );

        const sortedEnrichedData = sortData(filteredIEnrichedCertificateData);

        const paginatedData = sortedEnrichedData.slice(offset, offset + requestedPageSize);
        const total = sortedEnrichedData.length;

        return {
            paginatedData,
            total
        };
    }

    const { loadPage, paginatedData, pageSize, total } = usePaginatedLoaderFiltered({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [certificates]);

    async function claimCertificateBulk(selectedIndexes) {
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

        setSelectedCertificates(
            paginatedData
                .filter((item, index) => selectedIndexes.includes(index))
                .map(i => i.certificate)
        );
        setShowClaimBulkModal(true);
    }

    async function claimCertificate(rowIndex: number) {
        const certificateId = paginatedData[rowIndex].certificate.id;

        const certificate: Certificate.Entity = certificates.find(
            (cert: Certificate.Entity) => cert.id === certificateId.toString()
        );

        console.log({
            action: 'claim',
            certificate
        });

        if (certificate && certificate.isOwned(userAddress)) {
            dispatch(setLoading(true));
            await certificate.claim();
            dispatch(setLoading(false));
            showNotification(
                t('certificate.feedback.claimed', { id: certificate.id }),
                NotificationType.Success
            );
        }
    }

    function showCertificateDetails(rowIndex: number) {
        setDetailViewForCertificateId(paginatedData[rowIndex].certificate.id);
    }

    function getFilters(): ICustomFilterDefinition[] {
        if (![SelectedState.Claimed].includes(selectedState)) {
            return [];
        }

        const maxCertificateEnergyInDisplayUnit = EnergyFormatter.getValueInDisplayUnit(
            certificates.reduce((a, b) => (b.energy > a ? b.energy : a), 0)
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
                property: (record: IEnrichedCertificateData) => record?.producingDevice?.deviceType,
                label: t('certificate.properties.deviceType'),
                input: {
                    type: CustomFilterInputType.deviceType,
                    defaultOptions: []
                }
            },
            {
                property: (record: IEnrichedCertificateData) =>
                    moment
                        .unix(record?.producingDevice?.operationalSince)
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

        return filters.filter(filter => !hiddenColumns.includes(filter.label));
    }

    const filters = getFilters();

    function hideClaimBulkModal() {
        setShowClaimBulkModal(false);
    }

    function customSelectCounterGenerator(selectedIndexes: number[]) {
        if (selectedIndexes.length > 0) {
            const includedCertificates = paginatedData
                .filter((item, index) => selectedIndexes.includes(index))
                .map(i => i.certificate);

            const energy = includedCertificates.reduce((a, b) => a + b.energy, 0);

            return `${t('certificate.feedback.amountSelected', {
                amount: selectedIndexes.length
            })} (${EnergyFormatter.format(energy, true)})`;
        }
    }

    function getBatchableActions(): IBatchableAction[] {
        const actions = [];

        if (selectedState === SelectedState.Inbox) {
            actions.push({
                label: t('certificate.actions.claim'),
                handler: claimCertificateBulk
            });
        }

        return actions;
    }

    function getActions() {
        const actions = [];

        switch (selectedState) {
            case SelectedState.Inbox:
                actions.push({
                    name: t('certificate.actions.claim'),
                    icon: <AssignmentTurnedIn />,
                    onClick: (row: number) => claimCertificate(row)
                });
                break;
        }

        return actions;
    }

    const batchableActions = getBatchableActions();
    const actions = getActions();

    const columns = ([
        {
            id: 'deviceType',
            label: t('certificate.properties.deviceType'),
            sortProperties: [(record: IEnrichedCertificateData) => record?.deviceTypeLabel]
        },
        {
            id: 'commissioningDate',
            label: t('device.properties.commissioningDate'),
            sortProperties: [
                (record: IEnrichedCertificateData) => record?.producingDevice?.operationalSince
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
    ] as const).filter(column => !hiddenColumns.includes(column.id));

    const rows = paginatedData.map(enrichedData => {
        let deviceType = '';
        let commissioningDate = '';
        let compliance = '';

        if (enrichedData.producingDevice?.offChainProperties) {
            deviceType = deviceTypeService?.getDisplayText(
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

    if (detailViewForCertificateId !== null) {
        return <Redirect push={true} to={getCertificateDetailLink(detailViewForCertificateId)} />;
    }

    return (
        <>
            <TableMaterial
                columns={columns}
                rows={rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                batchableActions={batchableActions}
                customSelectCounterGenerator={customSelectCounterGenerator}
                filters={filters}
                handleRowClick={(row: number) => showCertificateDetails(row)}
                actions={actions}
                currentSort={currentSort}
                sortAscending={sortAscending}
                toggleSort={toggleSort}
            />

            <ClaimCertificateBulkModal
                certificates={selectedCertificates}
                showModal={showClaimBulkModal}
                callback={hideClaimBulkModal}
            />
        </>
    );
}
