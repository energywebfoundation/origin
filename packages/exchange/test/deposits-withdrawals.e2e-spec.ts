import { INestApplication } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { TransferDirection } from '../src/pods/transfer/transfer-direction';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Deposits using deployed registry', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let accountService: AccountService;

    const user1Id = '1';

    const web3 = 'http://localhost:8580';

    let registry: Contract;

    beforeAll(async () => {
        ({ accountService, databaseService, registry, app } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    afterAll(async () => {
        await app.close();
    });

    let depositAddress: string;

    const provider = new ethers.providers.JsonRpcProvider(web3);
    const tokenReceiverPrivateKey =
        '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
    const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);
    let tokenId = 1;

    const issueToken = async (to: string, amount: string) => {
        await registry.functions.issue(to, '0x0', 100, amount, '0x0');

        return tokenId++;
    };

    const depositToken = async (to: string, amount: string, id: number) => {
        const registryWithUserAsSigner = registry.connect(tokenReceiver);

        await registryWithUserAsSigner.functions.safeTransferFrom(
            tokenReceiver.address,
            to,
            id,
            amount,
            '0x0'
        );
    };

    beforeEach(async () => {
        const { address } = await accountService.getOrCreateAccount(user1Id);
        depositAddress = address;
    });

    const getBalance = async (address: string, id: number) => {
        return (await registry.functions.balanceOf(address, id)) as ethers.utils.BigNumber;
    };

    it('should discover token deposit', async () => {
        jest.setTimeout(10000);

        const depositAmount = '10';

        const id = await issueToken(tokenReceiver.address, '1000');
        await depositToken(depositAddress, depositAmount, id);

        await sleep(5000);

        await request(app.getHttpServer())
            .get('/transfer/all')
            .expect(200)
            .expect(res => {
                const transfers = res.body as Transfer[];
                const [tokenDeposit] = transfers;

                expect(transfers).toHaveLength(1);
                expect(tokenDeposit.userId).toBe(user1Id);
                expect(tokenDeposit.direction).toBe(TransferDirection.Deposit);
                expect(tokenDeposit.amount).toBe(depositAmount);
                expect(tokenDeposit.address).toBe(depositAddress);
            });
    });

    it('should withdraw to requested address', async () => {
        jest.setTimeout(15000);

        const withdrawalAddress = ethers.Wallet.createRandom().address;
        console.log(`withdrawalAddress=${withdrawalAddress}`);

        const withdrawalAmount = '5';
        const depositAmount = '10';

        const id = await issueToken(tokenReceiver.address, '1000');
        console.log('token id = ', id);
        await depositToken(depositAddress, depositAmount, id);

        await sleep(5000);

        const res = await request(app.getHttpServer()).get('/transfer/all');
        const [, deposit] = res.body as Transfer[];

        expect(deposit.id).toBeDefined();
        expect(deposit.asset.tokenId).toBe(id.toString());

        const withdrawal: RequestWithdrawalDTO = {
            assetId: deposit.asset.id,
            userId: user1Id,
            amount: withdrawalAmount,
            address: withdrawalAddress
        };

        const startBalance = await getBalance(withdrawalAddress, id);

        console.log(startBalance.toString());

        await request(app.getHttpServer())
            .post('/transfer/withdrawal')
            .send(withdrawal)
            .expect(201);

        await sleep(5000);

        const endBalance = await getBalance(withdrawalAddress, id);

        console.log(endBalance.toString());

        expect(endBalance.gt(startBalance)).toBeTruthy();
    });
});
