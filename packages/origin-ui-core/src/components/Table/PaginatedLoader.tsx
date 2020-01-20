import { Component } from 'react';
import { ICustomFilter } from './FiltersHeader';

export const DEFAULT_PAGE_SIZE = 25;

export type IPaginatedLoaderProps = {};

export interface IPaginatedLoaderState {
    paginatedData: any[];
    pageSize: number;
    total: number;
}

export interface IPaginatedLoaderFetchDataParameters {
    pageSize: number;
    offset: number;
    filters?: ICustomFilter[];
}

export interface IPaginatedLoaderFetchDataReturnValues {
    paginatedData: any[];
    total: number;
}

export interface IPaginatedLoader {
    getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues>;
}

export const PAGINATED_LOADER_INITIAL_STATE: IPaginatedLoaderState = {
    paginatedData: [],
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
};

export function getInitialPaginatedLoaderState(): IPaginatedLoaderState {
    return JSON.parse(JSON.stringify(PAGINATED_LOADER_INITIAL_STATE));
}

export abstract class PaginatedLoader<
    Props extends IPaginatedLoaderProps,
    State extends IPaginatedLoaderState
> extends Component<Props, State> implements IPaginatedLoader {
    protected isMountedIndicator = false;

    constructor(props: Props) {
        super(props);

        this.loadPage = this.loadPage.bind(this);
    }

    async componentDidMount() {
        this.isMountedIndicator = true;

        await this.loadPage(1);
    }

    componentWillUnmount() {
        this.isMountedIndicator = false;
    }

    abstract getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues>;

    async loadPage(page: number, filters?: ICustomFilter[]) {
        const { pageSize } = this.state;

        const offset = (page - 1) * pageSize;

        const { paginatedData, total } = await this.getPaginatedData({
            pageSize,
            offset,
            filters
        });

        if (!this.isMountedIndicator) {
            return;
        }

        this.setState({
            paginatedData,
            total
        });
    }
}
