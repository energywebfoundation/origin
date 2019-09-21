import { Demand } from '@energyweb/market';
import { User } from '@energyweb/user-registry';
import { Configuration, Currency, IRECAssetService, TimeFrame } from '@energyweb/utils-general';
import { Delete, Edit, FileCopy, Share } from '@material-ui/icons';
import moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';

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
    PaginatedLoaderFiltered,
    RECORD_INDICATOR
} from '../Table/PaginatedLoaderFiltered';
import { TableMaterial } from '../Table/TableMaterial';
import { calculateTotalEnergyDemand } from './DemandForm';
import { getCurrentUser } from '../../features/users/selectors';

interface IStateProps {
    configuration: Configuration.Entity;
    demands: Demand.Entity[];
    currentUser: User.Entity;
    baseURL: string;
}

type Props = RouteComponentProps<{}> & IStateProps;

export interface IDemandTableState extends IPaginatedLoaderFilteredState {
    showMatchingSupply: number;
    paginatedData: IEnrichedDemandData[];
}

export interface IEnrichedDemandData {
    demand: Demand.Entity;
    demandOwner: User.Entity;
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
                property: `${RECORD_INDICATOR}demand.status`,
                label: 'Status',
                input: {
                    type: CustomFilterInputType.multiselect,
                    availableOptions: [
                        {
                            label: 'Active',
                            value: Demand.DemandStatus.ACTIVE
                        },
                        {
                            label: 'Paused',
                            value: Demand.DemandStatus.PAUSED
                        },
                        {
                            label: 'Archived',
                            value: Demand.DemandStatus.ARCHIVED
                        }
                    ],
                    defaultOptions: [
                        Demand.DemandStatus.ACTIVE,
                        Demand.DemandStatus.PAUSED,
                        Demand.DemandStatus.ARCHIVED
                    ]
                }
            }
        ];
    }

    async enrichData(demands: Demand.Entity[]): Promise<IEnrichedDemandData[]> {
        const promises = demands.map(async (demand: Demand.Entity) => {
            return {
                demand,
                demandOwner: await new User.Entity(
                    demand.demandOwner,
                    this.props.configuration
                ).sync()
            };
        });

        return Promise.all(promises);
    }

    getRegionText(demand: Demand.Entity): string {
        let text = '';
        const { location } = demand.offChainProperties;

        if (location) {
            if (location.regions && location.regions.length) {
                text += location.regions.join(', ');
            }
        }

        return text || NO_VALUE_TEXT;
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
            demand.demandOwner.toLowerCase() !== this.props.currentUser.id.toLowerCase()
        ) {
            showNotification(
                `You need to be owner of the demand to edit it.`,
                NotificationType.Error
            );
            return;
        }

        this.props.history.push(getDemandEditLink(this.props.baseURL, demand.id));
    }

    viewDemand(rowIndex: number) {
        const demand = this.state.paginatedData[rowIndex].demand;

        this.props.history.push(getDemandViewLink(this.props.baseURL, demand.id));
    }

    cloneDemand(rowIndex: number) {
        const demand = this.state.paginatedData[rowIndex].demand;

        this.props.history.push(getDemandCloneLink(this.props.baseURL, demand.id));
    }

    async deleteDemand(rowIndex: number) {
        try {
            const demand = this.state.paginatedData[rowIndex].demand;

            this.props.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

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
        if (prevProps.demands.length !== this.props.demands.length) {
            this.loadPage(1);
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
        { id: 'assetType', label: 'Asset type' },
        { id: 'repeatable', label: 'Repeatable' },
        { id: 'fromSingleFacility', label: 'Single facility' },
        { id: 'vintage', label: 'Vintage' },
        { id: 'demand', label: 'Per timeframe (MWh)' },
        { id: 'max', label: 'Max price' },
        { id: 'status', label: 'Status' },
        { id: 'energy', label: 'Energy (MWh)' }
    ] as const;

    get rows() {
        return this.state.paginatedData.map(enrichedDemandData => {
            const demand = enrichedDemandData.demand;

            const assetService = new IRECAssetService();

            const topLevelAssetTypes = demand.offChainProperties.assetType
                ? assetService
                      .decode(demand.offChainProperties.assetType)
                      .filter(type => type.length === 1)
                : [];

            const assetType =
                topLevelAssetTypes.length > 0
                    ? topLevelAssetTypes.map(type => type[0]).join(', ')
                    : NO_VALUE_TEXT;

            const overallDemand = (
                calculateTotalEnergyDemand(
                    moment.unix(parseInt(demand.offChainProperties.startTime, 10)),
                    moment.unix(parseInt(demand.offChainProperties.endTime, 10)),
                    demand.offChainProperties.targetWhPerPeriod,
                    demand.offChainProperties.timeFrame
                ) / 1000000
            ).toLocaleString();

            let demandStatus = 'Active';

            if (demand.status === Demand.DemandStatus.PAUSED) {
                demandStatus = 'Paused';
            } else if (demand.status === Demand.DemandStatus.ARCHIVED) {
                demandStatus = 'Archived';
            }

            return {
                buyer: enrichedDemandData.demandOwner.organization,
                duration:
                    moment
                        .unix(parseInt(demand.offChainProperties.startTime, 10))
                        .format('DD MMM YY') +
                    ' - ' +
                    moment
                        .unix(parseInt(demand.offChainProperties.endTime, 10))
                        .format('DD MMM YY'),
                region: this.getRegionText(demand),
                assetType,
                repeatable:
                    typeof demand.offChainProperties.timeFrame !== 'undefined'
                        ? TimeFrame[demand.offChainProperties.timeFrame]
                        : NO_VALUE_TEXT,
                fromSingleFacility: demand.offChainProperties.procureFromSingleFacility
                    ? 'yes'
                    : 'no',
                vintage:
                    demand.offChainProperties.vintage &&
                    demand.offChainProperties.vintage.length === 2
                        ? `${demand.offChainProperties.vintage[0]} - ${demand.offChainProperties.vintage[1]}`
                        : NO_VALUE_TEXT,
                demand: (demand.offChainProperties.targetWhPerPeriod / 1000000).toLocaleString(),
                max: `${(demand.offChainProperties.maxPricePerMwh / 100).toFixed(2)} ${
                    Currency[demand.offChainProperties.currency]
                }`,
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
            baseURL: getBaseURL(state)
        })
    )(DemandTableClass)
);
