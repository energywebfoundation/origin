/* eslint-disable no-unused-expressions */
import { INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
import moment from 'moment';
import request from 'supertest';

import { DatabaseService } from '@energyweb/origin-backend-utils';
import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { Order } from '../src/pods/order/order.entity';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { TransferDirection } from '../src/pods/transfer/transfer-direction';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { depositToken, issueToken, provider, MWh } from './utils';
import { TransferStatus } from '../src/pods/transfer/transfer-status';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Deposits using deployed registry', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let transferService: TransferService;

    const user1Id = authenticatedUser.organization.id;

    let registry: Contract;
    let issuer: Contract;

    let depositAddress: string;

    const startExchange = async () => {
        ({
            accountService,
            databaseService,
            transferService,
            registry,
            issuer,
            app
        } = await bootstrapTestInstance());

        await app.init();

        const { address } = await accountService.getOrCreateAccount(user1Id);
        depositAddress = address;
    };

    before(startExchange);

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    const tokenReceiverPrivateKey =
        '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);

    const generationFrom = moment('2020-01-01').unix();
    const generationTo = moment('2020-01-31').unix();

    const getBalance = async (address: string, id: number): Promise<ethers.BigNumber> =>
        registry.balanceOf(address, id);

    it('should be able to discover token deposit and post the ask', async () => {
        const depositAmount = `${10 * MWh}`;

        const id = await issueToken(
            issuer,
            tokenReceiver.address,
            `${1000 * MWh}`,
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

                expect(transfers).to.have.length(1);
                expect(tokenDeposit.userId).equals(user1Id);
                expect(tokenDeposit.direction).equals(TransferDirection.Deposit);
                expect(tokenDeposit.amount).equals(depositAmount);
                expect(tokenDeposit.address).equals(depositAddress);
            });

        let assetId: string;

        await request(app.getHttpServer())
            .get('/account')
            .expect(200)
            .expect((res) => {
                const account = res.body as AccountDTO;

                const [balance] = account.balances.available;

                expect(balance.amount).equals(depositAmount);
                expect(new Date(balance.asset.generationFrom)).deep.equals(
                    moment.unix(generationFrom).toDate()
                );
                expect(new Date(balance.asset.generationTo)).deep.equals(
                    moment.unix(generationTo).toDate()
                );

                assetId = balance.asset.id;
            });

        const createAsk: CreateAskDTO = {
            assetId,
            volume: `${10 * MWh}`,
            price: 100,
            validFrom: new Date()
        };

        await request(app.getHttpServer())
            .post('/orders/ask')
            .send(createAsk)
            .expect(201)
            .expect((res) => {
                const order = res.body as Order;

                expect(order.price).equals(100);
                expect(order.startVolume).equals(`${10 * MWh}`);
                expect(order.assetId).equals(assetId);
                expect(new Date(order.product.generationFrom)).deep.equals(
                    moment.unix(generationFrom).toDate()
                );
                expect(new Date(order.product.generationTo)).deep.equals(
                    moment.unix(generationTo).toDate()
                );
            });
    });

    it('should withdraw to requested address', async () => {
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

        expect(deposit.id).to.be.ok;
        expect(deposit.asset.tokenId).equals(id.toString());

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

        expect(endBalance.gt(startBalance)).to.be.true;
    });

    it('should re-test unconfirmed withdrawal on start', async () => {
        const [confirmed] = await transferService.getByStatus(
            TransferStatus.Confirmed,
            TransferDirection.Withdrawal
        );

        await transferService.setAsUnconfirmed(confirmed.id, confirmed.transactionHash);

        await app.close();

        await startExchange();

        const transfer = await transferService.findOne(confirmed.id);

        expect(transfer.status).to.be.equal(TransferStatus.Confirmed);
        expect(transfer.confirmationBlock).to.be.equal(confirmed.confirmationBlock);
    });
});
