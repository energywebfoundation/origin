import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { Account } from '../src/pods/account/account';
import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { AssetDTO } from '../src/pods/asset/asset.dto';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { Order } from 'src/pods/order/order.entity';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = '1';
    let user1Address: string;

    const asset1Address = '0x9876';
    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    const createDeposit = (amount: string, asset: AssetDTO) => {
        return transferService.createDeposit({
            address: user1Address,
            transactionHash,
            amount,
            asset
        });
    };

    const confirmDeposit = () => {
        return transferService.confirmDeposit(transactionHash);
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [DatabaseService]
        }).compile();

        app = moduleFixture.createNestApplication();
        transferService = await app.resolve<TransferService>(TransferService);
        accountService = await app.resolve<AccountService>(AccountService);
        databaseService = await app.resolve<DatabaseService>(DatabaseService);

        await app.init();
    });

    describe('account deposit confirmation', async () => {
        const amount = '1000';
        const tokenId = '0';
        const asset = { address: asset1Address, tokenId, deviceId: tokenId };

        beforeEach(async () => {
            const { address } = await accountService.getOrCreateAccount(user1Id);
            user1Address = address;
        });

        it('should not list unconfirmed deposit', async () => {
            await createDeposit(amount, asset);

            await request(app.getHttpServer())
                .get('/account/1')
                .expect(200)
                .expect(res => {
                    const account = res.body as Account;

                    expect(account.address).toBe(user1Address);
                    expect(account.available.length).toBe(0);
                });
        });

        it('should list confirmed deposit', async () => {
            await createDeposit(amount, asset);
            await confirmDeposit();

            await request(app.getHttpServer())
                .get('/account/1')
                .expect(200)
                .expect(res => {
                    const account = res.body as AccountDTO;

                    expect(account.address).toBe(user1Address);
                    expect(account.available.length).toBe(1);
                    expect(account.available[0].amount).toEqual(amount);
                    expect(account.available[0].asset).toMatchObject(asset);
                });
        });
    });

    describe('account ask order send', () => {
        const amount = '1000';
        const tokenId = '0';
        const asset = { address: asset1Address, tokenId, deviceId: tokenId };

        let deposit: Transfer;

        beforeEach(async () => {
            const { address } = await accountService.getOrCreateAccount(user1Id);
            user1Address = address;
            deposit = await createDeposit(amount, asset);
            console.log(deposit);
        });

        it('should not be able to create ask order on unconfirmed deposit', async () => {
            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                volume: 100,
                price: 100,
                validFrom: new Date()
            };

            await request(app.getHttpServer())
                .post('/order/ask')
                .send(createAsk)
                .expect(403);
        });

        it('should be able to create ask order on confirmed deposit', async () => {
            await confirmDeposit();

            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                volume: 100,
                price: 100,
                validFrom: new Date()
            };

            await request(app.getHttpServer())
                .post('/order/ask')
                .send(createAsk)
                .expect(201)
                .expect(res => {
                    const order = res.body as Order;

                    expect(order.price).toBe(100);
                    expect(order.asset.id).toBe(deposit.asset.id);
                });
        });

        it('should not be able to create ask order bigger than confirmed deposit', async () => {
            await confirmDeposit();

            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                volume: 1001,
                price: 100,
                validFrom: new Date()
            };

            await request(app.getHttpServer())
                .post('/order/ask')
                .send(createAsk)
                .expect(403);
        });

        it('should not be able to create 2nd ask order bigger than remaining deposit', async () => {
            await confirmDeposit();

            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                volume: 1000,
                price: 100,
                validFrom: new Date()
            };

            await request(app.getHttpServer())
                .post('/order/ask')
                .send(createAsk)
                .expect(201);

            await request(app.getHttpServer())
                .post('/order/ask')
                .send(createAsk)
                .expect(403);
        });
    });

    afterEach(async () => {
        try {
            await databaseService.cleanUp();
        } catch (error) {
            console.error(error);
        }
    });

    afterAll(async () => {
        try {
            await app.close();
        } catch (error) {
            console.error(error);
        }
    });
});
