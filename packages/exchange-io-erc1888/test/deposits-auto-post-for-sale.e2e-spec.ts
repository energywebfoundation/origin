import { OrderSide, OrderStatus } from '@energyweb/exchange-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
import moment from 'moment';
import request from 'supertest';
import {
    AccountService,
    Order,
    IDeviceSettings,
    IExternalDeviceService,
    IProductInfo,
    testUtils
} from '@energyweb/exchange';
import { ExchangeErc1888Module } from '../src';

const web3 = 'http://localhost:8590';

const {
    authenticatedUser,
    createDepositAddress,
    depositToken,
    issueToken,
    provider,
    bootstrapTestInstance
} = testUtils;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Deposits automatic posting for sale', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = authenticatedUser.organization.id;

    let registry: Contract;
    let issuer: Contract;

    let depositAddress: string;

    const defaultAskPrice = 1000;

    const deviceServiceMock = {
        getDeviceProductInfo: async (): Promise<IProductInfo> => ({
            deviceType: 'Solar;Photovoltaic;Classic silicon',
            country: 'Thailand',
            region: 'Central',
            province: 'Nakhon Pathom',
            operationalSince: 2016,
            gridOperator: 'TH-PEA'
        }),
        getDeviceSettings: async (): Promise<IDeviceSettings> => ({
            postForSale: true,
            postForSalePrice: defaultAskPrice
        })
    } as IExternalDeviceService;

    before(async () => {
        ({
            accountService,
            databaseService,
            registry,
            issuer,
            app
        } = await bootstrapTestInstance(web3, deviceServiceMock, [ExchangeErc1888Module]));

        await app.init();
        depositAddress = await createDepositAddress(accountService, user1Id);
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    const tokenReceiverPrivateKey =
        '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);

    const generationFrom = moment('2020-01-01').unix();
    const generationTo = moment('2020-01-31').unix();

    it('should automatically post deposit token to sell', async () => {
        const depositAmount = '10';
        const id = await issueToken(
            issuer,
            tokenReceiver.address,
            '1000',
            generationFrom,
            generationTo
        );
        await depositToken(registry, tokenReceiver, depositAddress, depositAmount, id);

        await sleep(6000);

        await request(app.getHttpServer())
            .get('/orders')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const [ask] = res.body as Order[];

                expect(ask.currentVolume.toString(10)).equals(depositAmount);
                expect(ask.status).equals(OrderStatus.Active);
                expect(ask.side).equals(OrderSide.Ask);
                expect(ask.price).equals(defaultAskPrice);
            });
    });
});
