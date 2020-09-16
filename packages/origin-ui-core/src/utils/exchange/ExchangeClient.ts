/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestClient } from '@energyweb/origin-backend-client';
import {
    TOrderBook,
    CreateAskDTO,
    CreateBidDTO,
    IProductFilterDTO,
    ExchangeAccount,
    ITransfer,
    ITradeDTO,
    Order,
    IAsset,
    IDirectBuyDTO,
    IOrder,
    RequestWithdrawalDTO,
    Bundle,
    CreateBundleDTO
} from '.';
import { Filter, OrderStatus } from '@energyweb/exchange-core';
import { BundleSplits } from './types';
import { IRequestClient } from '@energyweb/origin-backend-core';

export interface IExchangeClient {
    search(
        deviceType?: string[],
        location?: string[],
        gridOperator?: string[],
        generationFrom?: string,
        generationTo?: string
    ): Promise<TOrderBook>;
    createAsk(data: CreateAskDTO): Promise<IOrder>;
    createBid(data: CreateBidDTO): Promise<IOrder>;
    directBuy(data: IDirectBuyDTO): Promise<{ success: boolean; status: OrderStatus }>;
    getAccount(): Promise<ExchangeAccount>;
    getAllTransfers(): Promise<ITransfer[]>;
    withdraw(withdrawal: RequestWithdrawalDTO): Promise<string>;
    getTrades(): Promise<ITradeDTO[]>;
    getAssetById(id: string): Promise<IAsset>;
    getOrderById(id: string): Promise<Order>;
    getOrders?(): Promise<Order[]>;
    cancelOrder(order: Order): Promise<Order>;
    getAvailableBundles(): Promise<Bundle[]>;
    getOwnBundles(): Promise<Bundle[]>;
    getBundleSplits(bundle: Bundle): Promise<BundleSplits>;
    createBundle(bundle: CreateBundleDTO): Promise<Bundle>;
    cancelBundle(id: string): Promise<Bundle>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ExchangeClient implements IExchangeClient {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async search(
        deviceType?: string[],
        location?: string[],
        gridOperator?: string[],
        generationFrom?: string,
        generationTo?: string
    ) {
        const deviceTypePresent = deviceType?.length > 0;
        const locationPresent = location?.length > 0;
        const gridOperatorPresent = gridOperator?.length > 0;

        const data: IProductFilterDTO = {
            deviceTypeFilter: deviceTypePresent ? Filter.Specific : Filter.Unspecified,
            locationFilter: locationPresent ? Filter.Specific : Filter.Unspecified,
            gridOperatorFilter: gridOperatorPresent ? Filter.Specific : Filter.Unspecified,
            generationTimeFilter:
                generationFrom && generationTo ? Filter.Specific : Filter.Unspecified,
            deviceVintageFilter: Filter.Unspecified,
            deviceType: deviceTypePresent ? deviceType : undefined,
            location: locationPresent ? location : undefined,
            gridOperator: gridOperatorPresent ? gridOperator : undefined,
            generationFrom: generationFrom ?? undefined,
            generationTo: generationTo ?? undefined
        };

        let url = `${this.orderbookEndpoint}/public/search`;

        if (this.requestClient.authenticationToken) {
            url = `${this.orderbookEndpoint}/search`;
        }

        const response = await this.requestClient.post<IProductFilterDTO, TOrderBook>(url, data);

        return response.data;
    }

    public async createAsk(data: CreateAskDTO) {
        const response = await this.requestClient.post<CreateAskDTO, IOrder>(
            `${this.ordersEndpoint}/ask`,
            data
        );

        return response.data;
    }

    public async createBid(data: CreateBidDTO): Promise<IOrder> {
        const response = await this.requestClient.post<CreateBidDTO, IOrder>(
            `${this.ordersEndpoint}/bid`,
            data
        );

        return response.data;
    }

    public async directBuy(
        data: IDirectBuyDTO
    ): Promise<{ success: boolean; status: OrderStatus }> {
        const response = await this.requestClient.post<IDirectBuyDTO, IOrder>(
            `${this.ordersEndpoint}/ask/buy`,
            data
        );

        await sleep(Number(process.env.EXCHANGE_MATCHING_INTERVAL) || 1000);

        const { status } = await this.getOrderById(response.data.id);

        return {
            success: status === OrderStatus.Filled,
            status
        };
    }

    public async getAccount() {
        const response = await this.requestClient.get<unknown, ExchangeAccount>(
            this.accountEndpoint
        );

        return response.data;
    }

    public async getAllTransfers() {
        const response = await this.requestClient.get<unknown, ITransfer[]>(
            `${this.transferEndpoint}/all`
        );

        return response.data;
    }

    public async withdraw(withdrawal: RequestWithdrawalDTO) {
        const response = await this.requestClient.post<unknown, string>(
            `${this.transferEndpoint}/withdrawal`,
            withdrawal
        );

        return response.data;
    }

    public async getTrades() {
        const response = await this.requestClient.get<unknown, ITradeDTO[]>(this.tradeEndpoint);

        return response.data;
    }

    public async getAssetById(id: string) {
        const response = await this.requestClient.get<unknown, IAsset>(
            `${this.assetEndpoint}/${id}`
        );

        return response.data;
    }

    public async getOrderById(id: string) {
        const response = await this.requestClient.get<unknown, Order>(
            `${this.ordersEndpoint}/${id}`
        );

        return response.data;
    }

    public async getAvailableBundles(): Promise<Bundle[]> {
        const response = await this.requestClient.get<unknown, Bundle[]>(
            `${this.bundleEndpoint}/available`
        );

        return response.data;
    }

    public async getOwnBundles(): Promise<Bundle[]> {
        const response = await this.requestClient.get<unknown, Bundle[]>(`${this.bundleEndpoint}`);

        return response.data;
    }

    public async cancelBundle(id: string): Promise<Bundle> {
        const response = await this.requestClient.put<unknown, Bundle>(
            `${this.bundleEndpoint}/${id}/cancel`
        );

        return response.data;
    }

    public async getBundleSplits(bundle: Bundle): Promise<BundleSplits> {
        const response = await this.requestClient.get<Bundle, BundleSplits>(
            `${this.bundleEndpoint}/${bundle.id}/splits`
        );

        return response.data;
    }

    public async createBundle(bundleDTO: CreateBundleDTO): Promise<Bundle> {
        const created = await this.requestClient.post<CreateBundleDTO, Bundle>(
            this.bundleEndpoint,
            bundleDTO
        );
        return created.data;
    }

    public async buyBundle(bundle: { bundleId: string; volume: number }): Promise<any> {
        const bundleTrade = await this.requestClient.post(`${this.bundleEndpoint}/buy`, bundle);
        return bundleTrade.data;
    }

    public async getOrders(): Promise<Order[]> {
        const orders = await this.requestClient.get<unknown, Order[]>(this.ordersEndpoint);
        return orders.data;
    }

    public async cancelOrder(order: Order): Promise<Order> {
        const response = await this.requestClient.post<unknown, Order>(
            `${this.ordersEndpoint}/${order.id}/cancel`
        );
        return response.data;
    }

    private get assetEndpoint() {
        return `${this.dataApiUrl}/asset`;
    }

    private get accountEndpoint() {
        return `${this.dataApiUrl}/account`;
    }

    private get ordersEndpoint() {
        return `${this.dataApiUrl}/orders`;
    }

    private get orderbookEndpoint() {
        return `${this.dataApiUrl}/orderbook`;
    }

    private get transferEndpoint() {
        return `${this.dataApiUrl}/transfer`;
    }

    private get tradeEndpoint() {
        return `${this.dataApiUrl}/trade`;
    }

    private get bundleEndpoint() {
        return `${this.dataApiUrl}/bundle`;
    }
}

export const ExchangeClientMock: IExchangeClient = {
    async search() {
        return ({
            asks: [
                {
                    id: '3016eaee-e93e-4356-a5c9-f45f228642f5',
                    price: 800,
                    volume: '3000000'
                },
                {
                    id: '2ead1352-cff0-41b7-b5ba-841e8de07d0f',
                    price: 850,
                    volume: '4000000'
                },
                {
                    id: 'b3da36a4-9562-466d-aa6e-9cf0aed8a336',
                    price: 860,
                    volume: '5000000'
                },
                {
                    id: 'c6463d76-bd4e-4015-beef-0834c7fb682a',
                    price: 1000,
                    volume: '250'
                },
                {
                    id: 'd34ca8db-fa66-47fa-9d3f-6d9d278c03b2',
                    price: 1100,
                    volume: '5000000'
                }
            ],
            bids: [
                {
                    id: 'ed4649f2-20f8-4589-a8be-296d4fe38d9c',
                    price: 900,
                    userId: '1',
                    volume: '2500000'
                },
                {
                    id: '47527400-26be-4830-aaa7-307e9a889b4e',
                    price: 850,
                    userId: '1',
                    volume: '2500000'
                },
                {
                    id: 'd6d8be53-4d50-4a71-9554-609a10bf2a73',
                    price: 790,
                    volume: '5000000'
                }
            ]
        } as Partial<TOrderBook>) as TOrderBook;
    },

    async createBid() {
        return ({
            id: '',
            price: 0,
            userId: '',
            product: null,
            side: 0,
            validFrom: '',
            volume: ''
        } as Partial<IOrder>) as IOrder;
    },

    async directBuy() {
        return {
            success: true,
            status: OrderStatus.Filled
        };
    },

    async createAsk() {
        return null;
    },

    async getAllTransfers() {
        return null;
    },

    async getAccount() {
        return null;
    },

    async getTrades() {
        return [];
    },

    async getAssetById() {
        return null;
    },

    async getOrderById() {
        return null;
    },

    async withdraw() {
        return null;
    },

    getAvailableBundles() {
        return null;
    },

    getOwnBundles() {
        return null;
    },

    createBundle(bundle: CreateBundleDTO) {
        return null;
    },

    cancelBundle(id: string) {
        return null;
    },

    getBundleSplits(bundle: Bundle) {
        return null;
    },

    getOrders() {
        return null;
    },

    cancelOrder(order: Order) {
        return null;
    }
};
