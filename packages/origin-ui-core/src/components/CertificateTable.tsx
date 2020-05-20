import { ProducingDevice } from '@energyweb/device-registry';
import { AssignmentTurnedIn, Publish } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { bigNumberify } from 'ethers/utils';
import { getConfiguration, getProducingDevices } from '../features/selectors';
import {
    EnergyFormatter,
    getDeviceLocationText,
    useLinks,
    formatDate,
    NotificationType,
    showNotification,
    useTranslation,
    getDeviceId,
    getDeviceFilters,
    getDeviceGridOperatorText,
    getDeviceColumns,
    getDeviceSpecificPropertiesSearchTitle,
    moment
} from '../utils';
import {
    IPaginatedLoaderFetchDataReturnValues,
    TableMaterial,
    CustomFilterInputType,
    ICustomFilterDefinition,
    IBatchableAction,
    usePaginatedLoaderSorting,
    checkRecordPassesFilters,
    usePaginatedLoaderFiltered,
    IPaginatedLoaderHooksFetchDataParameters,
    ITableAction
} from './Table';
import { getCertificates } from '../features/certificates/selectors';
import { PublishForSaleModal } from './Modal/PublishForSaleModal';
import { getEnvironment } from '../features';
import { ClaimModal } from './Modal/ClaimModal';
import { ICertificateViewItem, CertificateSource } from '../features/certificates';

interface IProps {
    certificates?: ICertificateViewItem[];
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IEnrichedCertificateData {
    certificate: ICertificateViewItem;
    producingDevice: ProducingDevice.Entity;
    deviceTypeLabel: string;
    locationText: string;
    gridOperatorText: string;
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
    const producingDevices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);

    const { selectedState } = props;
    const hiddenColumns = props.hiddenColumns || [];
    const certificates = props.certificates || stateCertificates;
    const deviceTypeService = configuration?.deviceTypeService;
    const { t } = useTranslation();
    const { getCertificateDetailLink } = useLinks();

    const [selectedCertificates, setSelectedCertificates] = useState<ICertificateViewItem[]>([]);
    const [detailViewForCertificateId, setDetailViewForCertificateId] = useState<number>(null);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<ICertificateViewItem>(null);
    const [sellModalVisibility, setSellModalVisibility] = useState(false);

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedData: IEnrichedCertificateData[] = certificates.map((certificate) => {
            const producingDevice =
                typeof certificate.deviceId !== 'undefined' &&
                producingDevices.find(
                    (device) => getDeviceId(device, environment) === certificate.deviceId.toString()
                );

            return {
                certificate,
                producingDevice,
                deviceTypeLabel: producingDevice?.deviceType,
                locationText: getDeviceLocationText(producingDevice),
                gridOperatorText: getDeviceGridOperatorText(producingDevice)
            };
        });

        const filteredIEnrichedCertificateData = enrichedData.filter((enrichedCertificateData) => {
            console.log(enrichedCertificateData.certificate);

            const ownerOf =
                enrichedCertificateData.certificate.isOwned ||
                enrichedCertificateData.certificate.source === CertificateSource.Exchange;
            const claimed = enrichedCertificateData.certificate.isClaimed;

            return (
                checkRecordPassesFilters(
                    enrichedCertificateData,
                    requestedFilters,
                    deviceTypeService
                ) &&
                ((ownerOf && selectedState === SelectedState.Inbox) ||
                    (claimed && selectedState === SelectedState.Claimed))
            );
        });

        const sortedEnrichedData = sortData(filteredIEnrichedCertificateData);

        const paginatedData = sortedEnrichedData.slice(offset, offset + requestedPageSize);
        const total = sortedEnrichedData.length;

        return {
            paginatedData,
            total
        };
    }

    const { loadPage, paginatedData, pageSize, total } = usePaginatedLoaderFiltered<
        IEnrichedCertificateData
    >({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [certificates]);

    async function claimCertificateBulk(selectedIndexes: string[]) {
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
                .filter((item, index) => selectedIndexes.includes(index.toString()))
                .map((i) => i.certificate)
        );
        setShowClaimModal(true);
    }

    const getCertificateFromRow = (rowIndex) =>
        certificates.find(
            (cert) =>
                cert.id === paginatedData[rowIndex].certificate.id &&
                cert.source === paginatedData[rowIndex].certificate.source
        );

    async function publishForSale(rowIndex: string) {
        setSelectedCertificate(getCertificateFromRow(rowIndex));
        setSellModalVisibility(true);
    }

    function hidePublishForSaleModal() {
        loadPage(1);
        setSelectedCertificate(null);
        setSellModalVisibility(false);
    }

    async function claimCertificate(rowIndex: string) {
        const certificate = getCertificateFromRow(rowIndex);

        if (certificate.source === CertificateSource.Exchange) {
            showNotification(
                'Claiming certificate from the exchange is currently not supported',
                NotificationType.Error
            );
            return;
        }

        setSelectedCertificates([certificate]);
        setShowClaimModal(true);
    }

    function showCertificateDetails(rowIndex: number) {
        setDetailViewForCertificateId(paginatedData[rowIndex].certificate.id);
    }

    function getFilters(): ICustomFilterDefinition[] {
        if (![SelectedState.Claimed].includes(selectedState)) {
            return [];
        }

        const filters: ICustomFilterDefinition[] = [
            {
                property: (record: IEnrichedCertificateData) =>
                    `${record?.locationText}${record?.gridOperatorText}`,
                label: getDeviceSpecificPropertiesSearchTitle(environment, t),
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
                    moment.unix(record?.producingDevice?.operationalSince).year().toString(),
                label: t('device.properties.vintageCod'),
                input: {
                    type: CustomFilterInputType.dropdown,
                    availableOptions: new Array(40).fill(moment().year()).map((item, index) => ({
                        label: (item - index).toString(),
                        value: item - index
                    }))
                }
            },
            ...getDeviceFilters(
                (record: IEnrichedCertificateData) => record?.locationText,
                (record: IEnrichedCertificateData) => record?.gridOperatorText,
                environment,
                t
            ),
            {
                property: (record: IEnrichedCertificateData) =>
                    record?.certificate?.creationTime?.toString(),
                label: t('certificate.properties.certificationDate'),
                input: {
                    type: CustomFilterInputType.yearMonth
                }
            },
            {
                property: (record: IEnrichedCertificateData): string => {
                    const ownedEnergy = record?.certificate?.energy;
                    if (ownedEnergy) {
                        let energy;

                        if (selectedState === SelectedState.Claimed) {
                            energy = ownedEnergy.claimedVolume;
                        } else {
                            energy = ownedEnergy.publicVolume.add(ownedEnergy.privateVolume);
                        }

                        return EnergyFormatter.getValueInDisplayUnit(energy).toString();
                    }
                    return EnergyFormatter.getValueInDisplayUnit(null).toString();
                },
                label: `${t('certificate.properties.certifiedEnergy')} (${
                    EnergyFormatter.displayUnit
                })`,
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: (record: IEnrichedCertificateData): string => {
                    const ownedEnergy = record?.certificate?.energy;
                    if (ownedEnergy) {
                        let energy;

                        if (selectedState === SelectedState.Claimed) {
                            energy = ownedEnergy.claimedVolume;
                        } else {
                            energy = ownedEnergy.publicVolume.add(ownedEnergy.privateVolume);
                        }

                        return EnergyFormatter.getValueInDisplayUnit(energy).toString();
                    }
                    return EnergyFormatter.getValueInDisplayUnit(null).toString();
                },
                label: `${t('certificate.properties.certifiedEnergy')} (${
                    EnergyFormatter.displayUnit
                })`,
                input: {
                    type: CustomFilterInputType.string
                }
            }
        ];

        return filters.filter((filter) => !hiddenColumns.includes(filter.label));
    }

    const filters = getFilters();

    function hideClaimModal() {
        setShowClaimModal(false);
    }

    function customSelectCounterGenerator(selectedIndexes: string[]) {
        if (selectedIndexes.length > 0) {
            const includedCertificates = paginatedData
                .filter((item, index) => selectedIndexes.includes(index?.toString()))
                .map((i) => i.certificate);

            const energy = includedCertificates.reduce((a, b) => {
                const { publicVolume, privateVolume } = b.energy;
                const totalOwned = publicVolume.add(privateVolume);
                return a.add(totalOwned);
            }, bigNumberify(0));

            return `${t('certificate.feedback.amountSelected', {
                amount: selectedIndexes.length
            })} (${EnergyFormatter.format(energy, true)})`;
        }
    }

    function getBatchableActions(): IBatchableAction[] {
        const actions: IBatchableAction[] = [];

        if (selectedState === SelectedState.Inbox) {
            actions.push({
                label: t('certificate.actions.claim'),
                handler: claimCertificateBulk
            });
        }

        return actions;
    }

    function getActions() {
        const actions: ITableAction[] = [];

        switch (selectedState) {
            case SelectedState.Inbox:
                actions.push({
                    name: t('certificate.actions.claim'),
                    icon: <AssignmentTurnedIn />,
                    onClick: claimCertificate
                });
                actions.push({
                    name: t('certificate.actions.publishForSale'),
                    icon: <Publish />,
                    onClick: publishForSale
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
            label: t('device.properties.vintageCod'),
            sortProperties: [
                (record: IEnrichedCertificateData) => record?.producingDevice?.operationalSince
            ]
        },
        ...getDeviceColumns(environment, t, [
            (record: IEnrichedCertificateData) => record?.locationText,
            (record: IEnrichedCertificateData) => record?.gridOperatorText
        ]),
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
                    (record: IEnrichedCertificateData) => {
                        const owned = record?.certificate?.energy;
                        if (!owned) return null;

                        let energy;

                        if (selectedState === SelectedState.Claimed) {
                            energy = owned.claimedVolume;
                        } else {
                            energy = owned.publicVolume.add(owned.privateVolume);
                        }

                        return energy.toString();
                    },
                    (value: string) => value
                ]
            ]
        },
        {
            id: 'source',
            label: `${t('certificate.properties.source')}`
        }
    ] as const).filter((column) => !hiddenColumns.includes(column.id));

    const rows = paginatedData.map((enrichedData) => {
        let deviceType = '';
        let commissioningDate = '';
        let compliance = '';

        if (enrichedData.producingDevice) {
            deviceType = deviceTypeService?.getDisplayText(enrichedData.producingDevice.deviceType);

            commissioningDate = formatDate(
                moment.unix(enrichedData.producingDevice.operationalSince)
            );

            compliance = enrichedData.producingDevice.complianceRegistry;
        }

        const { publicVolume, privateVolume, claimedVolume } = enrichedData.certificate.energy;

        return {
            deviceType,
            commissioningDate,
            deviceLocation: getDeviceLocationText(enrichedData.producingDevice),
            compliance,
            certificationDate: formatDate(moment.unix(enrichedData.certificate.creationTime)),
            energy: EnergyFormatter.format(
                selectedState === SelectedState.Claimed
                    ? claimedVolume
                    : publicVolume.add(privateVolume)
            ),
            gridOperator: enrichedData?.gridOperatorText,
            source:
                enrichedData.certificate.source === CertificateSource.Exchange
                    ? 'Exchange'
                    : 'Blockchain'
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
                handleRowClick={(rowIndex: string) =>
                    showCertificateDetails(parseInt(rowIndex, 10))
                }
                actions={actions}
                currentSort={currentSort}
                sortAscending={sortAscending}
                toggleSort={toggleSort}
            />

            <PublishForSaleModal
                certificate={selectedCertificate}
                producingDevice={
                    selectedCertificate
                        ? producingDevices.find(
                              (device) =>
                                  getDeviceId(device, environment) ===
                                  selectedCertificate.deviceId.toString()
                          )
                        : null
                }
                showModal={sellModalVisibility}
                callback={hidePublishForSaleModal}
            />

            <ClaimModal
                certificates={selectedCertificates}
                showModal={showClaimModal}
                callback={hideClaimModal}
            />
        </>
    );
}
