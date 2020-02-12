import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { Account } from '../src/pods/account/account';
import { AccountService } from '../src/pods/account/account.service';
import { AssetDTO } from '../src/pods/asset/asset.dto';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { Order } from '../src/pods/order/order.entity';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import BN from 'bn.js';

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
        return transferService.confirmTransfer(transactionHash);
    };

    beforeAll(async () => {
        const configService = new ConfigService({
            WEB3: 'http://localhost:8580',
            // ganache account 0
            EXCHANGE_ACCOUNT_DEPLOYER_PRIV:
                '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
            // ganache account 1
            EXCHANGE_WALLET_PUB: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
        });

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [DatabaseService]
        })
            .overrideProvider(ConfigService)
            .useValue(configService)
            .compile();

        app = moduleFixture.createNestApplication();
        transferService = await app.resolve<TransferService>(TransferService);
        accountService = await app.resolve<AccountService>(AccountService);
        databaseService = await app.resolve<DatabaseService>(DatabaseService);

        await app.init();
    });

    describe('account deposit confirmation', () => {
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
                    expect(account.balances.available.length).toBe(0);
                });
        });

        it('should list confirmed deposit', async () => {
            await createDeposit(amount, asset);
            await confirmDeposit();

            await request(app.getHttpServer())
                .get('/account/1')
                .expect(200)
                .expect(res => {
                    const account = res.body as Account;

                    // TODO: simplify
                    const expectedAmount = new BN(
                        account.balances.available[0].amount.toString(),
                        16
                    ).toString(10);

                    expect(account.address).toBe(user1Address);
                    expect(account.balances.available.length).toBe(1);
                    expect(expectedAmount).toEqual(amount);
                    expect(account.balances.available[0].asset).toMatchObject(asset);
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

        it('should not be able to withdraw without any deposit', async () => {
            const withdrawal: RequestWithdrawalDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                amount,
                address: '0x123'
            };

            await request(app.getHttpServer())
                .post('/account/withdrawal')
                .send(withdrawal)
                .expect(403);
        });

        it('should be able to withdraw after confirming deposit', async () => {
            await confirmDeposit();

            const withdrawal: RequestWithdrawalDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                amount,
                address: '0x123'
            };

            await request(app.getHttpServer())
                .post('/account/withdrawal')
                .send(withdrawal)
                .expect(201);

            await request(app.getHttpServer())
                .get('/account/1')
                .expect(200)
                .expect(res => {
                    const account = res.body as Account;

                    const expectedAmount = new BN(
                        account.balances.available[0].amount.toString(),
                        16
                    ).toString(10);

                    expect(account.address).toBe(user1Address);
                    expect(account.balances.available.length).toBe(1);
                    expect(expectedAmount).toEqual('0');
                    expect(account.balances.available[0].asset).toMatchObject(asset);
                });
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
