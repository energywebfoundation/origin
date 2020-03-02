import { Delete, Edit, FileCopy, Share } from '@material-ui/icons';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { Demand, MarketUser } from '@energyweb/market';
import { TimeFrame } from '@energyweb/utils-general';
import { IOrganizationWithRelationsIds, DemandStatus } from '@energyweb/origin-backend-core';
import { getBaseURL, getConfiguration, getDemands } from '../../features/selectors';
import { NotificationType, showNotification } from '../../utils/notifications';
import {
    getCertificatesForDemandLink,
    getDemandCloneLink,
    getDemandEditLink,
    getDemandViewLink
} from '../../utils/routing';
import { CustomFilterInputType, ICustomFilterDefinition } from '../Table/FiltersHeader';
import { IPaginatedLoaderFetchDataReturnValues } from '../Table/PaginatedLoader';
import { checkRecordPassesFilters } from '../Table/PaginatedLoaderFiltered';
import { TableMaterial } from '../Table/TableMaterial';
import { getCurrentUser } from '../../features/users/selectors';
import { formatDate } from '../../utils/helper';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { getOffChainDataSource } from '../../features/general/selectors';
import {
    usePaginatedLoaderFiltered,
    IPaginatedLoaderHooksFetchDataParameters
} from '../Table/PaginatedLoaderHooks';

export interface IEnrichedDemandData {
    demand: Demand.Entity;
    demandOwner: MarketUser.Entity;
    demandOwnerOrganization: IOrganizationWithRelationsIds;
}

const NO_VALUE_TEXT = 'any';

export function DemandTable() {
    const [showMatchingSupply, setShowMatchingSupply] = useState<number>(null);

    const baseURL = useSelector(getBaseURL);
    const configuration = useSelector(getConfiguration);
    const demands = useSelector(getDemands);
    const offChainDataSource = useSelector(getOffChainDataSource);
    const currentUser = useSelector(getCurrentUser);

    const history = useHistory();

    async function enrichData(): Promise<IEnrichedDemandData[]> {
        const promises = demands.map(async (demand: Demand.Entity) => {
            const demandOwner = await new MarketUser.Entity(demand.owner, configuration).sync();

            const demandOwnerOrganization = demandOwner
                ? await offChainDataSource?.organizationClient.getById(
                      demandOwner.information?.organization
                  )
                : null;

            return {
                demand,
                demandOwner,
                demandOwnerOrganization
            };
        });

        return Promise.all(promises);
    }

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const enrichedData = await enrichData();

        const filteredData = enrichedData.filter(record =>
            checkRecordPassesFilters(record, requestedFilters)
        );

        const total = filteredData.length;

        const paginatedData = filteredData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData,
            total
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<
        IEnrichedDemandData
    >({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [demands]);

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedDemandData) => record?.demand?.status.toString(),
            label: 'Status',
            input: {
                type: CustomFilterInputType.multiselect,
                availableOptions: [
                    {
                        label: 'Active',
                        value: DemandStatus.ACTIVE.toString()
                    },
                    {
                        label: 'Paused',
                        value: DemandStatus.PAUSED.toString()
                    },
                    {
                        label: 'Archived',
                        value: DemandStatus.ARCHIVED.toString()
                    }
                ],
                defaultOptions: [
                    DemandStatus.ACTIVE.toString(),
                    DemandStatus.PAUSED.toString(),
                    DemandStatus.ARCHIVED.toString()
                ]
            }
        }
    ];

    function getRegionText(demand: Demand.Entity): string {
        let text = '';
        const { location } = demand;

        if (location) {
            text = location
                .map(l => l.split(';')[1])
                .filter((value, index, self) => value && self.indexOf(value) === index)
                .join(', ');
        }

        return text || NO_VALUE_TEXT;
    }

    function viewDemand(rowIndex: number) {
        const demand = paginatedData[rowIndex].demand;

        history.push(getDemandViewLink(baseURL, demand.id.toString()));
    }

    function cloneDemand(rowIndex: number) {
        const demand = paginatedData[rowIndex].demand;

        history.push(getDemandCloneLink(baseURL, demand.id.toString()));
    }

    async function editDemand(rowIndex: number) {
        const demand = paginatedData[rowIndex].demand;

        if (!demand) {
            showNotification(`Can't find demand.`, NotificationType.Error);
            return;
        }

        if (!currentUser?.id || demand.owner.toLowerCase() !== currentUser.id.toLowerCase()) {
            showNotification(
                `You need to be owner of the demand to edit it.`,
                NotificationType.Error
            );
            return;
        }

        history.push(getDemandEditLink(baseURL, demand.id.toString()));
    }

    async function deleteDemand(rowIndex: number) {
        try {
            const demand = paginatedData[rowIndex].demand;

            if (!currentUser?.id || demand.owner.toLowerCase() !== currentUser.id.toLowerCase()) {
                showNotification(
                    `You need to be owner of the demand to delete it.`,
                    NotificationType.Error
                );
                return;
            }

            if (demand.status === DemandStatus.ARCHIVED) {
                showNotification(
                    `You can't delete a demand that has been already archived.`,
                    NotificationType.Error
                );
                return;
            }

            await Demand.deleteDemand(demand.id, configuration);

            showNotification('Demand deleted', NotificationType.Success);
        } catch (error) {
            console.error(error);
            showNotification(`Can't delete demand`, NotificationType.Error);
        }
    }

    const actions = [
        { icon: <Edit />, name: 'Edit', onClick: (row: number) => editDemand(row) },
        { icon: <FileCopy />, name: 'Clone', onClick: (row: number) => cloneDemand(row) },
        { icon: <Delete />, name: 'Delete', onClick: (row: number) => deleteDemand(row) },
        {
            icon: <Share />,
            name: 'Show supplies',
            onClick: (row: number) => setShowMatchingSupply(row)
        }
    ];

    const columns = [
        { id: 'buyer', label: 'Buyer' },
        { id: 'duration', label: 'Duration' },
        { id: 'region', label: 'Region' },
        { id: 'deviceType', label: 'Device type' },
        { id: 'repeatable', label: 'Repeatable' },
        { id: 'fromSingleFacility', label: 'Single facility' },
        { id: 'vintage', label: 'Vintage' },
        { id: 'demand', label: `Per timeframe (${EnergyFormatter.displayUnit})` },
        { id: 'max', label: 'Max price' },
        { id: 'status', label: 'Status' },
        { id: 'energy', label: `Energy (${EnergyFormatter.displayUnit})` }
    ] as const;

    const rows = paginatedData.map(enrichedDemandData => {
        const demand = enrichedDemandData.demand;

        const topLevelDeviceTypes = demand.deviceType
            ? configuration?.deviceTypeService
                  ?.decode(demand.deviceType)
                  .filter(type => type.length === 1)
            : [];

        const deviceType =
            topLevelDeviceTypes.length > 0
                ? topLevelDeviceTypes.map(type => type[0]).join(', ')
                : NO_VALUE_TEXT;

        const overallDemand = EnergyFormatter.format(
            Demand.calculateTotalEnergyDemand(
                demand.startTime,
                demand.endTime,
                demand.energyPerTimeFrame,
                demand.timeFrame
            )
        );

        let demandStatus = 'Active';

        if (demand.status === DemandStatus.PAUSED) {
            demandStatus = 'Paused';
        } else if (demand.status === DemandStatus.ARCHIVED) {
            demandStatus = 'Archived';
        }

        return {
            buyer: enrichedDemandData.demandOwnerOrganization?.name,
            duration: `${formatDate(moment.unix(demand.startTime))} - ${formatDate(
                moment.unix(demand.endTime)
            )}`,
            region: getRegionText(demand),
            deviceType,
            repeatable:
                typeof demand.timeFrame !== 'undefined'
                    ? TimeFrame[demand.timeFrame]
                    : NO_VALUE_TEXT,
            fromSingleFacility: demand.procureFromSingleFacility ? 'yes' : 'no',
            vintage:
                demand.vintage?.length === 2
                    ? `${demand.vintage[0]} - ${demand.vintage[1]}`
                    : NO_VALUE_TEXT,
            demand: EnergyFormatter.format(demand.energyPerTimeFrame),
            max: `${(demand.maxPriceInCentsPerMwh / 100).toFixed(2)} ${demand.currency}`,
            status: demandStatus,
            energy: overallDemand
        };
    });

    if (showMatchingSupply !== null) {
        return (
            <Redirect push={true} to={getCertificatesForDemandLink(baseURL, showMatchingSupply)} />
        );
    }

    return (
        <div className="ForSaleWrapper">
            <TableMaterial
                columns={columns}
                rows={rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                filters={filters}
                handleRowClick={row => viewDemand(row)}
                actions={actions}
            />
        </div>
    );
}
