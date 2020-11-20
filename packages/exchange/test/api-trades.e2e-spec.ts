import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { DatabaseService } from '@energyweb/origin-backend-utils';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { CreateBidDTO } from '../src/pods/order/create-bid.dto';
import { OrderService } from '../src/pods/order/order.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Trades API', () => {
    let app: INestApplication;
    let orderService: OrderService;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const dummyAsset = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    const createDeposit = (address: string, amount = '1000', asset = dummyAsset) => {
        return transferService.createDeposit({
            address,
            transactionHash,
            amount,
            asset
        });
    };

    const confirmDeposit = () => {
        return transferService.setAsConfirmed(transactionHash, 10000);
    };

    const testTrade = async (sellerId: string, buyerId: string) => {
        const { address: sellerAddress } = await accountService.getOrCreateAccount(sellerId);

        const deposit = await createDeposit(sellerAddress);
        await confirmDeposit();

        const createAsk: CreateAskDTO = {
            assetId: deposit.asset.id,
            volume: '100',
            price: 100,
            validFrom: new Date()
        };

        const createBid: CreateBidDTO = {
            price: 100,
            validFrom: new Date(),
            volume: '100',
            product: { deviceType: ['Solar'] }
        };

        const ask = await orderService.createAsk(sellerId, createAsk);
        await orderService.createBid(buyerId, createBid);

        await sleep(2000);

        await request(app.getHttpServer())
            .get('/trade')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const [trade] = res.body as TradeDTO[];

                expect(trade.assetId).equals(deposit.asset.id);
                expect(trade.product).deep.equals(ask.product);
            });
    };

    before(async () => {
        ({
            orderService,
            accountService,
            databaseService,
            transferService,
            app
        } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.truncate('exchange_order', 'exchange_trade', 'exchange_transfer');
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should be able to read the product information from the ask as a buyer', async () => {
        const buyerId = authenticatedUser.organization.id;
        const sellerId = '2';

        await testTrade(sellerId, buyerId);
    });

    it('should be able to read the product information from the ask as a seller', async () => {
        const buyerId = '2';
        const sellerId = authenticatedUser.organization.id;

        await testTrade(sellerId, buyerId);
    });
});
