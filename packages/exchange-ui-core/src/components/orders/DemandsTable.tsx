import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Remove, Visibility } from '@material-ui/icons';
import {
    useTranslation,
    EnergyFormatter,
    formatCurrencyComplete,
    getConfiguration,
    getCurrencies,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    checkRecordPassesFilters,
    ICustomFilterDefinition,
    CustomFilterInputType,
    FilterRules,
    TableMaterial
} from '@energyweb/origin-ui-core';
import {
    configureTimeFrame,
    configureStatus,
    configureDateFormat,
    periodTypeOptions,
    demandTypeOptions
} from '../../utils/demand';
import { Demand } from '../../utils/exchange';
import { RemoveOrderConfirmation, DemandUpdateModal } from '../modal';

const DEMANDS_PER_PAGE = 5;

interface IOwnProps {
    demands: Demand[];
}

export const DemandsTable = (props: IOwnProps) => {
    const { demands } = props;
    const { t } = useTranslation();

    const [demandToView, setToView] = useState<Demand>();
    const [demandToRemove, setToRemove] = useState<Demand>();

    const configuration = useSelector(getConfiguration);
    const deviceTypeService = configuration?.deviceTypeService;
    const periodOptions = periodTypeOptions(t, false);
    const demandOptions = demandTypeOptions(t);

    const columns = [
        { id: 'volume', label: t('demand.properties.volume') },
        { id: 'price', label: t('demand.properties.price') },
        { id: 'device_type', label: t('demand.properties.device_type') },
        { id: 'demandPeriod', label: t('demand.properties.period') },
        { id: 'demandStart', label: t('demand.properties.start') },
        { id: 'demandEnd', label: t('demand.properties.end') },
        { id: 'status', label: t('demand.properties.status') }
    ];

    const getFilters = (): ICustomFilterDefinition[] => [
        {
            property: (demand: Demand) =>
                demand.periodTimeFrame ? demand.periodTimeFrame : undefined,
            label: t('demand.properties.period'),
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: periodOptions.map((period) => ({
                    label: period.label,
                    value: period.value
                }))
            }
        },
        {
            property: (demand: Demand) => (demand.status ? demand.status : undefined),
            label: t('demand.properties.status'),
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: demandOptions.map((status) => ({
                    label: status.label,
                    value: status.value
                }))
            }
        },
        {
            property: (demand: Demand) => new Date(demand.start).getTime() / 1000,
            label: t('demand.properties.start'),
            input: {
                type: CustomFilterInputType.yearMonth,
                filterRule: FilterRules.FROM
            }
        },
        {
            property: (demand: Demand) => new Date(demand.end).getTime() / 1000,
            label: t('demand.properties.end'),
            input: {
                type: CustomFilterInputType.yearMonth,
                filterRule: FilterRules.TO
            }
        }
    ];

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const filteredAsks = demands.filter((ask) => {
            return checkRecordPassesFilters(ask, requestedFilters, deviceTypeService);
        });
        return {
            paginatedData: filteredAsks.slice(offset, offset + requestedPageSize),
            total: filteredAsks.length
        };
    }

    const { paginatedData, loadPage, total, pageSize, setPageSize } = usePaginatedLoaderFiltered<
        Demand
    >({
        getPaginatedData,
        initialPageSize: DEMANDS_PER_PAGE
    });

    const [currency = 'USD'] = useSelector(getCurrencies);

    const rows = paginatedData.map((demand) => {
        const {
            volumePerPeriod,
            price,
            product: { deviceType },
            periodTimeFrame,
            start,
            end,
            status,
            id
        } = demand;
        return {
            volume: EnergyFormatter.format(Number(volumePerPeriod), true),
            price: formatCurrencyComplete(parseFloat(price) / 100, currency),
            device_type: deviceType ? deviceType[0].split(';')[0] : 'Any',
            demandPeriod: configureTimeFrame(periodTimeFrame, t, false),
            demandStart: start ? configureDateFormat(start, periodTimeFrame) : '-',
            demandEnd: end ? configureDateFormat(end, periodTimeFrame) : '-',
            status: configureStatus(status, t),
            demandId: id
        };
    });

    useEffect(() => {
        setPageSize(DEMANDS_PER_PAGE);
        loadPage(1);
    }, [demands]);

    const viewDetails = (rowIndex: number) => {
        const { demandId } = rows[rowIndex];
        const demand = demands.find((d) => d.id === demandId);
        setToView(demand);
    };

    const removeDemand = (rowIndex: number) => {
        const { demandId } = rows[rowIndex];
        const demand = demands.find((d) => d.id === demandId);
        setToRemove(demand);
    };

    const actions = [
        {
            icon: <Visibility />,
            name: t('order.actions.update'),
            onClick: (row: string) => viewDetails(parseInt(row, 10))
        },
        {
            icon: <Remove />,
            name: t('order.actions.remove'),
            onClick: (row: string) => removeDemand(parseInt(row, 10))
        }
    ];

    return (
        <>
            <TableMaterial
                handleRowClick={(row: string) => viewDetails(parseInt(row, 10))}
                columns={columns}
                rows={rows}
                filters={getFilters()}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                actions={actions}
                caption={t('order.captions.demands')}
            />
            {demandToView && (
                <DemandUpdateModal demand={demandToView} close={() => setToView(null)} />
            )}
            {demandToRemove && (
                <RemoveOrderConfirmation demand={demandToRemove} close={() => setToRemove(null)} />
            )}
        </>
    );
};
