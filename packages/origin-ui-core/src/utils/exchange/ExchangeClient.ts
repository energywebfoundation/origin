import { IRequestClient, RequestClient } from '@energyweb/origin-backend-client';
import { TOrderBook, ProductDTO, CreateBidDTO, IOrder } from '.';

export interface IExchangeClient {
    search(deviceType?: string[], location?: string[]): Promise<TOrderBook>;
    createBid(data: CreateBidDTO): Promise<IOrder>;
}

export class ExchangeClient implements IExchangeClient {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async search(deviceType?: string[], location?: string[]) {
        const data: ProductDTO = {
            deviceType: deviceType?.length > 0 ? deviceType : undefined,
            location: location?.length > 0 ? location : undefined
        };

        const response = await this.requestClient.post<ProductDTO, TOrderBook>(
            `${this.orderbookEndpoint}/search`,
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

    private get ordersEndpoint() {
        return `${this.dataApiUrl}/orders`;
    }

    private get orderbookEndpoint() {
        return `${this.dataApiUrl}/orderbook`;
    }
}

export const ExchangeClientMock: IExchangeClient = {
    async search() {
        return {
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
        };
    },

    async createBid() {
        return {
            id: '',
            price: 0,
            userId: ''
        };
    }
};
