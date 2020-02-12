import { Delete, Edit, FileCopy, Share } from '@material-ui/icons';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';

import { Demand, MarketUser } from '@energyweb/market';
import { Configuration, TimeFrame } from '@energyweb/utils-general';
import { IOrganizationWithRelationsIds, DemandStatus } from '@energyweb/origin-backend-core';
import { IOrganizationClient } from '@energyweb/origin-backend-client';

import { getBaseURL, getConfiguration, getDemands } from '../../features/selectors';
import { IStoreState } from '../../types';
import { NotificationType, showNotification } from '../../utils/notifications';
import {
    getCertificatesForDemandLink,
    getDemandCloneLink,
    getDemandEditLink,
    getDemandViewLink
} from '../../utils/routing';
import { CustomFilterInputType, ICustomFilterDefinition } from '../Table/FiltersHeader';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from '../Table/PaginatedLoader';
import {
    getInitialPaginatedLoaderFilteredState,
    IPaginatedLoaderFilteredState,
    PaginatedLoaderFiltered
} from '../Table/PaginatedLoaderFiltered';
import { TableMaterial } from '../Table/TableMaterial';
import { getCurrentUser } from '../../features/users/selectors';
import { formatDate } from '../../utils/helper';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { getOffChainDataSource } from '../../features/general/selectors';

interface IStateProps {
    configuration: Configuration.Entity;
    demands: Demand.Entity[];
    currentUser: MarketUser.Entity;
    baseURL: string;
    organizationClient: IOrganizationClient;
}

type Props = RouteComponentProps<{}> & IStateProps;

export interface IDemandTableState extends IPaginatedLoaderFilteredState {
    showMatchingSupply: number;
    paginatedData: IEnrichedDemandData[];
}

export interface IEnrichedDemandData {
    demand: Demand.Entity;
    demandOwner: MarketUser.Entity;
    demandOwnerOrganization: IOrganizationWithRelationsIds;
}

const NO_VALUE_TEXT = 'any';

class DemandTableClass extends PaginatedLoaderFiltered<Props, IDemandTableState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            showMatchingSupply: null
        };
    }

    get filters(): ICustomFilterDefinition[] {
        return [
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
    }

    async enrichData(demands: Demand.Entity[]): Promise<IEnrichedDemandData[]> {
        const promises = demands.map(async (demand: Demand.Entity) => {
            const demandOwner = await new MarketUser.Entity(
                demand.owner,
                this.props.configuration
            ).sync();

            const demandOwnerOrganization = demandOwner
                ? await this.props.organizationClient.getById(demandOwner.information?.organization)
                : null;

            return {
                demand,
                demandOwner,
                demandOwnerOrganization
            };
        });

        return Promise.all(promises);
    }

    getRegionText(demand: Demand.Entity): string {
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

    viewDemand(rowIndex: number) {
        const demand = this.state.paginatedData[rowIndex].demand;

        this.props.history.push(getDemandViewLink(this.props.baseURL, demand.id.toString()));
    }

    cloneDemand(rowIndex: number) {
        const demand = this.state.paginatedData[rowIndex].demand;

        this.props.history.push(getDemandCloneLink(this.props.baseURL, demand.id.toString()));
    }

    async editDemand(rowIndex: number) {
        const demand = this.state.paginatedData[rowIndex].demand;

        if (!demand) {
            showNotification(`Can't find demand.`, NotificationType.Error);
            return;
        }

        if (
            !this.props.currentUser ||
            !this.props.currentUser.id ||
            demand.owner.toLowerCase() !== this.props.currentUser.id.toLowerCase()
        ) {
            showNotification(
                `You need to be owner of the demand to edit it.`,
                NotificationType.Error
            );
            return;
        }

        this.props.history.push(getDemandEditLink(this.props.baseURL, demand.id.toString()));
    }

    async deleteDemand(rowIndex: number) {
        try {
            const demand = this.state.paginatedData[rowIndex].demand;

            if (
                !this.props.currentUser ||
                !this.props.currentUser.id ||
                demand.owner.toLowerCase() !== this.props.currentUser.id.toLowerCase()
            ) {
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

            await Demand.deleteDemand(demand.id, this.props.configuration);

            showNotification('Demand deleted', NotificationType.Success);
        } catch (error) {
            console.error(error);
            showNotification(`Can't delete demand`, NotificationType.Error);
        }
    }

    showMatchingSupply(demandId: number) {
        this.setState({
            showMatchingSupply: demandId
        });
    }

    async getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const { demands } = this.props;
        const enrichedData = await this.enrichData(demands);

        const filteredData = enrichedData.filter(record =>
            this.checkRecordPassesFilters(record, filters)
        );

        const total = filteredData.length;

        const paginatedData = filteredData.slice(offset, offset + pageSize);

        return {
            paginatedData,
            total
        };
    }

    async componentDidUpdate(prevProps: Props) {
        if (prevProps.demands !== this.props.demands) {
            await this.loadPage(1);
        }
    }

    actions = [
        { icon: <Edit />, name: 'Edit', onClick: (row: number) => this.editDemand(row) },
        { icon: <FileCopy />, name: 'Clone', onClick: (row: number) => this.cloneDemand(row) },
        { icon: <Delete />, name: 'Delete', onClick: (row: number) => this.deleteDemand(row) },
        {
            icon: <Share />,
            name: 'Show supplies',
            onClick: (row: number) => this.showMatchingSupply(row)
        }
    ];

    columns = [
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

    get rows() {
        return this.state.paginatedData.map(enrichedDemandData => {
            const demand = enrichedDemandData.demand;

            const topLevelDeviceTypes = demand.deviceType
                ? this.props.configuration?.deviceTypeService
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
                region: this.getRegionText(demand),
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
    }

    render() {
        const { showMatchingSupply, total, pageSize } = this.state;

        if (showMatchingSupply !== null) {
            return (
                <Redirect
                    push={true}
                    to={getCertificatesForDemandLink(this.props.baseURL, showMatchingSupply)}
                />
            );
        }

        return (
            <div className="ForSaleWrapper">
                <TableMaterial
                    columns={this.columns}
                    rows={this.rows}
                    loadPage={this.loadPage}
                    total={total}
                    pageSize={pageSize}
                    filters={this.filters}
                    handleRowClick={(row: number) => this.viewDemand(row)}
                    actions={this.actions}
                />
            </div>
        );
    }
}

export const DemandTable = withRouter(
    connect(
        (state: IStoreState): IStateProps => ({
            configuration: getConfiguration(state),
            demands: getDemands(state),
            currentUser: getCurrentUser(state),
            baseURL: getBaseURL(),
            organizationClient: getOffChainDataSource(state)?.organizationClient
        })
    )(DemandTableClass)
);
