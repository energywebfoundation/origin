import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
import moment from 'moment';
import request from 'supertest';
import {
    AccountBalanceDTO,
    AccountService,
    CreateAskDTO,
    Order,
    RequestWithdrawalDTO,
    TransferDirection,
    TransferStatus,
    Transfer,
    TransferService,
    DB_TABLE_PREFIX,
    testUtils
} from '@energyweb/exchange';

import { authenticatedUser, bootstrapTestInstance } from './exchange';

const { createDepositAddress, depositToken, issueToken, MWh, provider } = testUtils;
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
    let tokenId: number;

    const tokenReceiverPrivateKey =
        '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);

    const generationFrom = moment('2020-01-01').unix();
    const generationTo = moment('2020-01-31').unix();

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

        tokenId = await issueToken(
            issuer,
            tokenReceiver.address,
            `${1000 * MWh}`,
            generationFrom,
            generationTo
        );
    };

    const depositToExchangeAddress = async (amount: string) => {
        await depositToken(registry, tokenReceiver, depositAddress, amount, tokenId);

        await sleep(5000);

        const res = await request(app.getHttpServer()).get('/transfer/all');
        const [transfer] = res.body as Transfer[];

        // eslint-disable-next-line no-unused-expressions
        expect(transfer.id).to.be.ok;
        expect(transfer.asset.tokenId).equals(tokenId.toString());

        return transfer.asset.id;
    };

    before(startExchange);

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    beforeEach(async () => {
        await databaseService.truncate(`${DB_TABLE_PREFIX}_order`, `${DB_TABLE_PREFIX}_transfer`);
        depositAddress = await createDepositAddress(accountService, user1Id);
    });

    const getBalance = async (address: string, id: number): Promise<ethers.BigNumber> =>
        registry.balanceOf(address, id);

    it('should be able to discover token deposit and post the ask', async () => {
        const depositAmount = `${10 * MWh}`;

        await depositToken(registry, tokenReceiver, depositAddress, depositAmount, tokenId);

        await sleep(5000);

        await request(app.getHttpServer())
            .get('/transfer/all')
            .expect(HttpStatus.OK)
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
            .get('/account-balance')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const {
                    available: [balance]
                } = res.body as AccountBalanceDTO;

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
            .expect(HttpStatus.CREATED)
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

        const assetId = await depositToExchangeAddress(depositAmount);

        const withdrawal: RequestWithdrawalDTO = {
            assetId,
            amount: withdrawalAmount,
            address: withdrawalAddress
        };

        const startBalance = await getBalance(withdrawalAddress, tokenId);

        await request(app.getHttpServer())
            .post('/transfer/withdrawal')
            .send(withdrawal)
            .expect(HttpStatus.CREATED);

        await sleep(5000);

        const endBalance = await getBalance(withdrawalAddress, tokenId);

        expect(endBalance.gt(startBalance)).to.equal(true);
    });

    it('should re-test unconfirmed withdrawal on start', async () => {
        const withdrawalAddress = ethers.Wallet.createRandom().address;
        const amount = '5';

        const assetId = await depositToExchangeAddress(amount);

        const withdrawal: RequestWithdrawalDTO = {
            assetId,
            amount,
            address: withdrawalAddress
        };

        await request(app.getHttpServer())
            .post('/transfer/withdrawal')
            .send(withdrawal)
            .expect(HttpStatus.CREATED);

        await sleep(5000);

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

    it('should not allow withdrawing to more than available assets', async () => {
        const withdrawalAddress = ethers.Wallet.createRandom().address;
        const withdrawalAmount = '10';
        const depositAmount = '10';

        const depositAddress2 = await createDepositAddress(accountService, 'user2');
        await depositToken(registry, tokenReceiver, depositAddress2, depositAmount, tokenId);

        const assetId = await depositToExchangeAddress(depositAmount);

        const withdrawal: RequestWithdrawalDTO = {
            assetId,
            amount: withdrawalAmount,
            address: withdrawalAddress
        };

        for (let i = 0; i < 10; i++) {
            request(app.getHttpServer())
                .post('/transfer/withdrawal')
                .send(withdrawal)
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .end(() => {});
        }

        await sleep(5000);

        const endBalance = await getBalance(withdrawalAddress, tokenId);

        expect(endBalance.toString()).to.be.equal(withdrawalAmount);
    });
});
