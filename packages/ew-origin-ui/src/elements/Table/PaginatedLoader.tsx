import { Component, ReactText } from 'react';

export const DEFAULT_PAGE_SIZE = 25;

export type IPaginatedLoaderProps = any;

export interface IPaginatedLoaderState {
    data: ReactText[][];
    pageSize: number;
    total: number;
}

export interface IPaginatedLoaderFetchDataParameters {
    pageSize: number;
    offset: number;
}

export interface IPaginatedLoaderFetchDataReturnValues {
    data: ReactText[][];
    total: number;
}

export interface IPaginatedLoader {
    getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters) : Promise<IPaginatedLoaderFetchDataReturnValues>
}

export abstract class PaginatedLoader<Props extends IPaginatedLoaderProps, State extends IPaginatedLoaderState> extends Component<Props, State> implements IPaginatedLoader {
    protected _isMounted: boolean = false;

    constructor(props: Props) {
        super(props);

        this.loadPage = this.loadPage.bind(this);
    }

    async componentDidMount() {
        this._isMounted = true;

        await this.loadPage(1);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    abstract getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues>

    async loadPage(page: number) {
        const {
            pageSize
        } = this.state;

        const offset = (page - 1) * pageSize;

        const { total, data } = await this.getPaginatedData({
            pageSize,
            offset
        });

        if (!this._isMounted) {
          return;
        }

        this.setState({
          data,
          total
        });
    }
}