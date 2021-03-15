import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { AssignmentTurnedIn, Publish, Undo, BusinessCenter } from '@material-ui/icons';
import {
    getCertificates,
    ICertificateViewItem,
    CertificateSource,
    getConfiguration,
    getEnvironment,
    getBackendClient,
    getAllDevices,
    fetchAllDevices,
    getUserOffchain
} from '../../../features';
import { formatDate, moment } from '../../../utils/time';
import {
    getDeviceLocationText,
    getDeviceId,
    getDeviceFilters,
    getDeviceGridOperatorText,
    getDeviceColumns,
    getDeviceSpecificPropertiesSearchTitle,
    NotificationType,
    showNotification,
    EnergyFormatter,
    useLinks
} from '../../../utils';
import { IOriginDevice } from '../../../types';
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
    TableActionId,
    TableFallback,
    TableAction
} from '../../Table';
import { PublishForSaleModal, ClaimModal, WithdrawModal, DepositModal } from '../../Modal';

interface IProps {
    certificates?: ICertificateViewItem[];
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IEnrichedCertificateData {
    certificate: ICertificateViewItem;
    producingDevice: IOriginDevice;
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

export function CertificateTable(props: IProps): JSX.Element {
    const { currentSort, sortAscending, sortData, toggleSort } = usePaginatedLoaderSorting({
        currentSort: {
            id: CERTIFICATION_DATE_COLUMN_ID,
            sortProperties: CERTIFICATION_DATE_COLUMN_SORT_PROPERTIES
        },
        sortAscending: false
    });

    const certificates = useSelector(getCertificates);
    const configuration = useSelector(getConfiguration);
    const allDevices = useSelector(getAllDevices);
    const environment = useSelector(getEnvironment);
    const backendClient = useSelector(getBackendClient);
    const deviceClient = backendClient?.deviceClient;
    const dispatch = useDispatch();

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchAllDevices());
        }
    }, [deviceClient]);

    const { selectedState } = props;
    const hiddenColumns = props.hiddenColumns || [];
    const deviceTypeService = configuration?.deviceTypeService;
    const { t } = useTranslation();
    const { getCertificateDetailLink } = useLinks();

    const [selectedCertificates, setSelectedCertificates] = useState<ICertificateViewItem[]>([]);
    const [detailViewForCertificateId, setDetailViewForCertificateId] = useState<number>(null);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<ICertificateViewItem>(null);
    const [sellModalVisibility, setSellModalVisibility] = useState(false);
    const [withdrawModalVisibility, setWithdrawModalVisibility] = useState(false);
    const [depositModalVisibility, setDepositModalVisibility] = useState(false);

    const user = useSelector(getUserOffchain);
    const hasBlockchainAccount = Boolean(user.blockchainAccountAddress);

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedData: IEnrichedCertificateData[] = certificates.map((certificate) => {
            const producingDevice =
                typeof certificate.deviceId !== 'undefined' &&
                allDevices !== null &&
                allDevices.find(
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
            const { source, isOwned, isClaimed } = enrichedCertificateData.certificate;

            const ownerOf = isOwned || source === CertificateSource.Exchange;
            const claimed = isClaimed && source === CertificateSource.Blockchain;

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

    const {
        loadPage,
        paginatedData,
        pageSize,
        total
    } = usePaginatedLoaderFiltered<IEnrichedCertificateData>({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [certificates, allDevices]);

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

    async function withdraw(rowIndex: string) {
        if (!hasBlockchainAccount) {
            showNotification(t('certificate.feedback.pleaseAddBlockchain'), NotificationType.Error);
        }

        const certificate = getCertificateFromRow(rowIndex);
        setSelectedCertificate(certificate);
        setWithdrawModalVisibility(true);
    }

    function hideWithdrawModal() {
        loadPage(1);
        setSelectedCertificate(null);
        setWithdrawModalVisibility(false);
    }

    async function deposit(rowIndex: string) {
        const certificate = getCertificateFromRow(rowIndex);
        setSelectedCertificate(certificate);
        setDepositModalVisibility(true);
    }

    function hideDepositModal() {
        loadPage(1);
        setSelectedCertificate(null);
        setDepositModalVisibility(false);
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
            }, BigNumber.from(0));

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
        const actions: TableAction[] = [];

        switch (selectedState) {
            case SelectedState.Inbox:
                actions.push({
                    id: TableActionId.Claim,
                    name: t('certificate.actions.claim'),
                    icon: <AssignmentTurnedIn />,
                    onClick: claimCertificate
                });
                actions.push((row) => {
                    console.log(row);
                    if (row?.source === 'Blockchain') {
                        return null;
                    }
                    return {
                        id: TableActionId.PublishForSale,
                        name: t('certificate.actions.publishForSale'),
                        icon: <Publish />,
                        onClick: publishForSale
                    };
                });
                if (user.blockchainAccountAddress !== null) {
                    actions.push({
                        id: TableActionId.Withdraw,
                        name: t('certificate.actions.withdraw'),
                        icon: <Undo />,
                        onClick: withdraw
                    });
                }
                actions.push({
                    id: TableActionId.Deposit,
                    name: t('certificate.actions.deposit'),
                    icon: <BusinessCenter />,
                    onClick: deposit
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
            deviceLocation: enrichedData.producingDevice
                ? getDeviceLocationText(enrichedData.producingDevice)
                : '-',
            compliance,
            certificationDate: formatDate(moment.unix(enrichedData.certificate.creationTime)),
            energy: EnergyFormatter.format(
                selectedState === SelectedState.Claimed
                    ? claimedVolume
                    : publicVolume.add(privateVolume)
            ),
            gridOperator: enrichedData.gridOperatorText,
            source:
                enrichedData.certificate.source === CertificateSource.Exchange
                    ? 'Exchange'
                    : 'Blockchain'
        };
    });

    if (detailViewForCertificateId !== null) {
        return <Redirect push={true} to={getCertificateDetailLink(detailViewForCertificateId)} />;
    }

    const allowedActions = {
        Blockchain: [TableActionId.PublishForSale, TableActionId.Deposit, TableActionId.Claim],
        Exchange: [TableActionId.PublishForSale, TableActionId.Withdraw]
    };

    if (certificates === null || allDevices === null) {
        return <TableFallback />;
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
                allowedActions={allowedActions}
            />

            <PublishForSaleModal
                certificate={selectedCertificate}
                device={
                    selectedCertificate
                        ? allDevices.find(
                              (device) =>
                                  getDeviceId(device, environment) ===
                                  selectedCertificate.deviceId.toString()
                          )
                        : null
                }
                showModal={sellModalVisibility}
                callback={hidePublishForSaleModal}
            />

            <WithdrawModal
                certificate={selectedCertificate}
                device={
                    selectedCertificate
                        ? allDevices.find(
                              (device) =>
                                  getDeviceId(device, environment) ===
                                  selectedCertificate.deviceId.toString()
                          )
                        : null
                }
                showModal={withdrawModalVisibility}
                callback={hideWithdrawModal}
            />

            <DepositModal
                certificate={selectedCertificate}
                device={
                    selectedCertificate
                        ? allDevices.find(
                              (device) =>
                                  getDeviceId(device, environment) ===
                                  selectedCertificate.deviceId.toString()
                          )
                        : null
                }
                showModal={depositModalVisibility}
                callback={hideDepositModal}
            />

            <ClaimModal
                certificates={selectedCertificates}
                showModal={showClaimModal}
                callback={hideClaimModal}
            />
        </>
    );
}
