import {
    ICustomFilter,
    RecordPropertyGetterFunction,
    ITableColumn,
    CustomFilterInputType,
    FilterRules
} from '.';
import { useState } from 'react';
import { IDeviceTypeService } from '@energyweb/utils-general';
import { moment, Moment } from '../../utils';

export const DEFAULT_PAGE_SIZE = 25;

export interface IPaginatedLoaderFetchDataReturnValues {
    paginatedData: any[];
    total: number;
}

export interface IPaginatedLoaderState {
    paginatedData: any[];
    pageSize: number;
    total: number;
}

export const PAGINATED_LOADER_INITIAL_STATE: IPaginatedLoaderState = {
    paginatedData: [],
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
};

export type SortPropertiesType = ReadonlyArray<
    | RecordPropertyGetterFunction
    | readonly [
          RecordPropertyGetterFunction,
          (
              value: ReturnType<RecordPropertyGetterFunction>
          ) => ReturnType<RecordPropertyGetterFunction>
      ]
>;

export type CurrentSortType = {
    id: ITableColumn['id'];
    sortProperties: ITableColumn['sortProperties'];
};

export interface IPaginatedLoaderHooksFetchDataParameters {
    requestedPageSize: number;
    offset: number;
    requestedFilters?: ICustomFilter[];
}

interface IUsePaginatedLoaderParameters<T> {
    getPaginatedData: ({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters) => Promise<{
        paginatedData: T[];
        total: number;
    }>;
    initialPageSize?: number;
}

export function usePaginatedLoader<T>({
    getPaginatedData,
    initialPageSize = DEFAULT_PAGE_SIZE
}: IUsePaginatedLoaderParameters<T>) {
    const [paginatedData, setPaginatedData] = useState<T[]>(
        PAGINATED_LOADER_INITIAL_STATE.paginatedData
    );
    const [total, setTotal] = useState(PAGINATED_LOADER_INITIAL_STATE.total);
    const [pageSize, setPageSize] = useState(initialPageSize);

    async function loadPage(
        page: number,
        requestedFilters?: ICustomFilter[],
        checkIsMounted?: () => boolean
    ) {
        const offset = (page - 1) * pageSize;
        const { paginatedData: newPaginatedData, total: newTotal } = await getPaginatedData({
            requestedPageSize: pageSize,
            offset,
            requestedFilters
        });
        if (!checkIsMounted || checkIsMounted()) {
            setPaginatedData(newPaginatedData);
            setTotal(newTotal);
        }
    }

    function removeItem(index: number) {
        const newData = paginatedData.filter((d) => d !== paginatedData[index]);
        setPaginatedData(newData);
        setTotal(newData.length);
    }

    return {
        loadPage,
        pageSize,
        paginatedData,
        setPageSize,
        total,
        removeItem
    };
}

export function usePaginatedLoaderFiltered<T>({
    getPaginatedData,
    initialPageSize = DEFAULT_PAGE_SIZE
}: IUsePaginatedLoaderParameters<T>) {
    const {
        paginatedData,
        pageSize,
        loadPage: paginatedLoaderLoadPage,
        setPageSize,
        total
    } = usePaginatedLoader({
        getPaginatedData,
        initialPageSize
    });

    const [appliedFilters, setAppliedFilters] = useState<ICustomFilter[]>([]);

    async function loadPage(
        page: number,
        requestedFilters?: ICustomFilter[],
        checkIsMounted?: () => boolean
    ) {
        if (requestedFilters) {
            setAppliedFilters(requestedFilters);
        } else if (appliedFilters) {
            requestedFilters = appliedFilters;
        }

        paginatedLoaderLoadPage(page, requestedFilters, checkIsMounted);
    }

    return {
        loadPage,
        pageSize,
        paginatedData,
        setPageSize,
        total
    };
}

export function usePaginatedLoaderSorting<T>({
    currentSort: defaultCurrentSort,
    sortAscending: defaultSortAscending
}: {
    currentSort: CurrentSortType;
    sortAscending: boolean;
}) {
    const [currentSort, setCurrentSort] = useState<CurrentSortType>(defaultCurrentSort);
    const [sortAscending, setSortAscending] = useState<boolean>(defaultSortAscending);

    function sortData(records: T[]) {
        return records.sort((a, b) => {
            return currentSort?.sortProperties
                ?.map((field) => {
                    const direction = sortAscending ? 1 : -1;

                    let aPropertyValue;
                    let bPropertyValue;

                    if (typeof field === 'function') {
                        aPropertyValue = field(a);
                        bPropertyValue = field(b);
                    } else if (field.length === 2) {
                        aPropertyValue = field[1](field[0](a));
                        bPropertyValue = field[1](field[0](b));
                    }

                    if (aPropertyValue > bPropertyValue) {
                        return direction;
                    }

                    if (aPropertyValue < bPropertyValue) {
                        return -direction;
                    }

                    return 0;
                })
                .reduce((previous, next) => previous || next, 0);
        });
    }

    function toggleSort(column: CurrentSortType) {
        if (column.id === currentSort.id) {
            setSortAscending(!sortAscending);
        } else {
            setCurrentSort(column);
            setSortAscending(true);
        }
    }

    return {
        sortData,
        toggleSort,
        currentSort,
        sortAscending
    };
}

export function checkRecordPassesFilters(
    record: any,
    filters: ICustomFilter[],
    deviceTypeService?: IDeviceTypeService
): boolean {
    if (!filters) {
        return true;
    }

    for (const filter of filters) {
        const filteredPropertyResolvedValue = filter.property(record);
        if (typeof filteredPropertyResolvedValue !== 'undefined') {
            switch (filter.input.type) {
                case CustomFilterInputType.string:
                    if (
                        filter.selectedValue &&
                        !filteredPropertyResolvedValue
                            .toString()
                            .toLowerCase()
                            .includes(filter.selectedValue.toLowerCase())
                    ) {
                        return false;
                    }
                    break;
                case CustomFilterInputType.multiselect:
                    return filter.selectedValue.includes(filteredPropertyResolvedValue);
                case CustomFilterInputType.deviceType:
                    if (!deviceTypeService) {
                        throw new Error(
                            `PaginatedLoaderFiltered requires "deviceTypeService" to be set to use "deviceType" filter`
                        );
                    }
                    if (
                        filter.selectedValue &&
                        filter.selectedValue.length !== 0 &&
                        !deviceTypeService.includesDeviceType(
                            filteredPropertyResolvedValue?.toString(),
                            filter.selectedValue as string[]
                        )
                    ) {
                        return false;
                    }
                    break;
                case CustomFilterInputType.dropdown:
                    if (
                        filter.selectedValue &&
                        filter.selectedValue.toString() !== filteredPropertyResolvedValue.toString()
                    ) {
                        return false;
                    }
                    break;
                case CustomFilterInputType.slider:
                    if (filter.selectedValue) {
                        const [min, max] = filter.selectedValue as number[];

                        const valueAsNumber =
                            typeof filteredPropertyResolvedValue === 'number'
                                ? filteredPropertyResolvedValue
                                : parseInt(filteredPropertyResolvedValue.toString(), 10);

                        if (valueAsNumber < min || valueAsNumber > max) {
                            return false;
                        }
                    }
                    break;
                case CustomFilterInputType.yearMonth:
                    if (filter.selectedValue) {
                        const year = (filter.selectedValue as Moment).year();
                        const month = (filter.selectedValue as Moment).month();
                        const recordDate = moment.unix(
                            parseInt(filteredPropertyResolvedValue?.toString(), 10)
                        );
                        const { filterRule = FilterRules.EQUAL } = filter.input;
                        switch (filterRule) {
                            case FilterRules.EQUAL:
                                if (recordDate.month() !== month || recordDate.year() !== year) {
                                    return false;
                                }
                                break;
                            case FilterRules.FROM:
                                if (
                                    recordDate.year() < year ||
                                    (recordDate.year() === year && recordDate.month() < month)
                                ) {
                                    return false;
                                }
                                break;
                            case FilterRules.TO:
                                if (
                                    recordDate.year() > year ||
                                    (recordDate.year() === year && recordDate.month() > month)
                                ) {
                                    return false;
                                }
                                break;
                        }
                    }
                    break;
            }
        }
    }

    return true;
}
