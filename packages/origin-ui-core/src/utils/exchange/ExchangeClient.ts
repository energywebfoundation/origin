import { IRequestClient, RequestClient } from '@energyweb/origin-backend-client';
import {
    TOrderBook,
    CreateAskDTO,
    CreateBidDTO,
    IOrder,
    IProductFilterDTO,
    ExchangeAccount,
    ITransfer
} from '.';
import { Filter } from '@energyweb/exchange-core';

export interface IExchangeClient {
    search(deviceType?: string[], location?: string[]): Promise<TOrderBook>;
    createAsk(data: CreateAskDTO): Promise<IOrder>;
    createBid(data: CreateBidDTO): Promise<IOrder>;
    getAccount(): Promise<ExchangeAccount>;
    getAllTransfers(): Promise<ITransfer[]>;
    getOrders?(): Promise<any>;
}

const DUMMY_ISO_STRING = '2020-03-30T12:03:17.940Z';

export class ExchangeClient implements IExchangeClient {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async search(deviceType?: string[], location?: string[]) {
        const deviceTypePresent = deviceType?.length > 0;
        const locationPresent = location?.length > 0;

        const data: IProductFilterDTO = {
            deviceTypeFilter: deviceTypePresent ? Filter.Specific : Filter.Unspecified,
            locationFilter: locationPresent ? Filter.Specific : Filter.Unspecified,
            generationTimeFilter: Filter.Unspecified,
            deviceVintageFilter: Filter.Unspecified,
            deviceType: deviceTypePresent ? deviceType : undefined,
            location: locationPresent ? location : undefined,
            generationFrom: DUMMY_ISO_STRING,
            generationTo: DUMMY_ISO_STRING
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

    public async getAccount() {
        const response = await this.requestClient.get<{}, ExchangeAccount>(this.accountEndpoint);

        return response.data;
    }

    public async getAllTransfers() {
        const response = await this.requestClient.get<{}, ITransfer[]>(
            `${this.transferEndpoint}/all`
        );

        return response.data;
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
    },

    async createAsk() {
        return null;
    },

    async getAllTransfers() {
        return null;
    },

    async getAccount() {
        return null;
    }
};
