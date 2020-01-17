import { ICustomFilter } from './FiltersHeader';
import { PAGINATED_LOADER_INITIAL_STATE, DEFAULT_PAGE_SIZE } from './PaginatedLoader';
import { useState } from 'react';

export interface IPaginatedLoaderHooksFetchDataParameters {
    requestedPageSize: number;
    offset: number;
    filters?: ICustomFilter[];
}

interface IUsePaginatedLoaderParameters<T> {
    getPaginatedData: ({
        requestedPageSize,
        offset,
        filters
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
        filters?: ICustomFilter[],
        checkIsMounted?: () => boolean
    ) {
        const offset = (page - 1) * pageSize;

        const { paginatedData: newPaginatedData, total: newTotal } = await getPaginatedData({
            requestedPageSize: pageSize,
            offset,
            filters
        });

        if (!checkIsMounted || checkIsMounted()) {
            setPaginatedData(newPaginatedData);
            setTotal(newTotal);
        }
    }

    return {
        loadPage,
        pageSize,
        paginatedData,
        setPageSize,
        total
    };
}
