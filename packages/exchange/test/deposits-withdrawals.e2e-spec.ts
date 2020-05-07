import { INestApplication } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import moment from 'moment';
import request from 'supertest';

import { Account } from '../src/pods/account/account';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { Order } from '../src/pods/order/order.entity';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { TransferDirection } from '../src/pods/transfer/transfer-direction';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';
import { depositToken, issueToken, provider } from './utils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Deposits using deployed registry', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = '1';

    let registry: Contract;
    let issuer: Contract;

    let depositAddress: string;

    beforeAll(async () => {
        ({
            accountService,
            databaseService,
            registry,
            issuer,
            app
        } = await bootstrapTestInstance());

        await app.init();

        const { address } = await accountService.getOrCreateAccount(user1Id);
        depositAddress = address;
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    const tokenReceiverPrivateKey =
        '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);

    const generationFrom = moment('2020-01-01').unix();
    const generationTo = moment('2020-01-31').unix();

    const getBalance = async (address: string, id: number) => {
        return (await registry.functions.balanceOf(address, id)) as ethers.utils.BigNumber;
    };

    it('should be able to discover token deposit and post the ask', async () => {
        jest.setTimeout(10000);

        const depositAmount = '10';

        const id = await issueToken(
            issuer,
            tokenReceiver.address,
            '1000',
            generationFrom,
            generationTo
        );
        await depositToken(registry, tokenReceiver, depositAddress, depositAmount, id);

        await sleep(5000);

        await request(app.getHttpServer())
            .get('/transfer/all')
            .expect(200)
            .expect((res) => {
                const transfers = res.body as Transfer[];
                const [tokenDeposit] = transfers;

                expect(transfers).toHaveLength(1);
                expect(tokenDeposit.userId).toBe(user1Id);
                expect(tokenDeposit.direction).toBe(TransferDirection.Deposit);
                expect(tokenDeposit.amount).toBe(depositAmount);
                expect(tokenDeposit.address).toBe(depositAddress);
            });

        let assetId: string;

        await request(app.getHttpServer())
            .get('/account')
            .expect(200)
            .expect((res) => {
                const account = res.body as Account;

                const [balance] = account.balances.available;

                expect(balance.amount).toBe('10');
                expect(new Date(balance.asset.generationFrom)).toStrictEqual(
                    moment.unix(generationFrom).toDate()
                );
                expect(new Date(balance.asset.generationTo)).toStrictEqual(
                    moment.unix(generationTo).toDate()
                );

                assetId = balance.asset.id;
            });

        const createAsk: CreateAskDTO = {
            assetId,
            volume: '10',
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(201)
            .expect((res) => {
                const order = res.body as Order;

                expect(order.price).toBe(100);
                expect(order.startVolume).toBe('10');
                expect(order.assetId).toBe(assetId);
                expect(new Date(order.product.generationFrom)).toStrictEqual(
                    moment.unix(generationFrom).toDate()
                );
                expect(new Date(order.product.generationTo)).toStrictEqual(
                    moment.unix(generationTo).toDate()
                );
            });
    });

    it('should withdraw to requested address', async () => {
        jest.setTimeout(15000);

        const withdrawalAddress = ethers.Wallet.createRandom().address;
        const withdrawalAmount = '5';
        const depositAmount = '10';

        const id = await issueToken(
            issuer,
            tokenReceiver.address,
            '1000',
            generationFrom,
            generationTo
        );
        await depositToken(registry, tokenReceiver, depositAddress, depositAmount, id);

        await sleep(5000);

        const res = await request(app.getHttpServer()).get('/transfer/all');
        const [, deposit] = res.body as Transfer[];

        expect(deposit.id).toBeDefined();
        expect(deposit.asset.tokenId).toBe(id.toString());

        const withdrawal: RequestWithdrawalDTO = {
            assetId: deposit.asset.id,
            amount: withdrawalAmount,
            address: withdrawalAddress
        };

        const startBalance = await getBalance(withdrawalAddress, id);

        await request(app.getHttpServer())
            .post('/transfer/withdrawal')
            .send(withdrawal)
            .expect(201);

        await sleep(5000);

        const endBalance = await getBalance(withdrawalAddress, id);

        expect(endBalance.gt(startBalance)).toBeTruthy();
    });
});
