import { INestApplication } from '@nestjs/common';
import { Contract, ethers, ContractTransaction } from 'ethers';
import request from 'supertest';

import { Account } from '../src/pods/account/account';
import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { DemandService } from '../src/pods/demand/demand.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { DirectBuyDTO } from '../src/pods/order/direct-buy.dto';
import { OrderType } from '../src/pods/order/order-type.enum';
import { OrderDTO } from '../src/pods/order/order.dto';
import { Order } from '../src/pods/order/order.entity';
import { OrderService } from '../src/pods/order/order.service';
import { ProductService } from '../src/pods/product/product.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { TransferDirection } from '../src/pods/transfer/transfer-direction';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let demandService: DemandService;
    let orderService: OrderService;
    let productService: ProductService;

    const user1Id = '1';
    const dummyAsset = { address: '0x9876', tokenId: '0', deviceId: '0' };

    const transactionHash = `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;
    const withdrawalAddress = ethers.Wallet.createRandom().address;

    const web3 = 'http://localhost:8580';

    let registry: Contract;

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

    beforeEach(async () => {
        ({
            transferService,
            accountService,
            databaseService,
            demandService,
            orderService,
            productService,
            registry,
            app
        } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    describe('account deposit confirmation', () => {
        let user1Address: string;
        const amount = '100';

        beforeEach(async () => {
            const { address } = await accountService.getOrCreateAccount(user1Id);
            user1Address = address;
        });

        it('should not list unconfirmed deposit', async () => {
            await createDeposit(user1Address, amount);

            await request(app.getHttpServer())
                .get('/account')
                .expect(200)
                .expect(res => {
                    const account = res.body as Account;

                    expect(account.address).toBe(user1Address);
                    expect(account.balances.available.length).toBe(0);
                });
        });

        it('should list confirmed deposit', async () => {
            await createDeposit(user1Address, amount);
            await confirmDeposit();

            await request(app.getHttpServer())
                .get('/account')
                .expect(200)
                .expect(res => {
                    const account = res.body as AccountDTO;

                    expect(account.address).toBe(user1Address);
                    expect(account.balances.available.length).toBe(1);
                    expect(account.balances.available[0].amount).toEqual(amount);
                    expect(account.balances.available[0].asset).toMatchObject(dummyAsset);
                });
        });
    });

    describe('account ask order send', () => {
        let deposit: Transfer;
        let user1Address: string;
        const amount = '1000';

        beforeEach(async () => {
            const { address } = await accountService.getOrCreateAccount(user1Id);
            user1Address = address;
            deposit = await createDeposit(address);
        });

        it('should not be able to create ask order on unconfirmed deposit', async () => {
            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                volume: '100',
                price: 100,
                validFrom: new Date().toISOString()
            };

            await request(app.getHttpServer())
                .post('/orders/ask')
                .send(createAsk)
                .expect(403);
        });

        it('should be able to create ask order on confirmed deposit', async () => {
            await confirmDeposit();

            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                volume: '100',
                price: 100,
                validFrom: new Date().toISOString()
            };

            await request(app.getHttpServer())
                .post('/orders/ask')
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
                volume: '1001',
                price: 100,
                validFrom: new Date().toISOString()
            };

            await request(app.getHttpServer())
                .post('/orders/ask')
                .send(createAsk)
                .expect(403);
        });

        it('should not be able to create 2nd ask order bigger than remaining deposit', async () => {
            await confirmDeposit();

            const createAsk: CreateAskDTO = {
                assetId: deposit.asset.id,
                volume: '1000',
                price: 100,
                validFrom: new Date().toISOString()
            };

            await request(app.getHttpServer())
                .post('/orders/ask')
                .send(createAsk)
                .expect(201);

            await request(app.getHttpServer())
                .post('/orders/ask')
                .send(createAsk)
                .expect(403);
        });

        it('should not be able to withdraw without any deposit', async () => {
            const withdrawal: RequestWithdrawalDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                amount,
                address: withdrawalAddress
            };

            await request(app.getHttpServer())
                .post('/transfer/withdrawal')
                .send(withdrawal)
                .expect(403);
        });

        it('should be able to withdraw after confirming deposit', async () => {
            jest.setTimeout(10000);

            await confirmDeposit();

            const withdrawal: RequestWithdrawalDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                amount,
                address: withdrawalAddress
            };

            await request(app.getHttpServer())
                .post('/transfer/withdrawal')
                .send(withdrawal)
                .expect(201);

            await request(app.getHttpServer())
                .get('/account')
                .expect(200)
                .expect(res => {
                    const account = res.body as AccountDTO;

                    expect(account.address).toBe(user1Address);
                    expect(account.balances.available.length).toBe(1);
                    expect(account.balances.available[0].amount).toEqual('0');
                    expect(account.balances.available[0].asset).toMatchObject(dummyAsset);
                });

            // wait to withdrawal to be finished to not mess with tx nonces
            await sleep(5000);
        });
    });

    describe('Deposits using deployed registry', () => {
        let depositAddress: string;

        const provider = new ethers.providers.JsonRpcProvider(web3);
        const tokenReceiverPrivateKey =
            '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
        const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);

        const issueToken = async (to: string, amount: string) => {
            await registry.functions.issue(to, '0x0', 100, amount, '0x0');
        };

        const depositToken = async (to: string, amount: string) => {
            const registryWithUserAsSigner = registry.connect(tokenReceiver);

            await registryWithUserAsSigner.functions.safeTransferFrom(
                tokenReceiver.address,
                to,
                1,
                amount,
                '0x0'
            );
        };

        beforeEach(async () => {
            const { address } = await accountService.getOrCreateAccount(user1Id);
            depositAddress = address;
        });

        it('should discover token deposit', async () => {
            jest.setTimeout(10000);

            const depositAmount = '10';

            await issueToken(tokenReceiver.address, '1000');
            await depositToken(depositAddress, depositAmount);

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

            const withdrawalAmount = '5';
            const startBalance = (await registry.functions.balanceOf(
                withdrawalAddress,
                1
            )) as ethers.utils.BigNumber;

            const depositAmount = '10';

            await issueToken(tokenReceiver.address, '1000');
            await depositToken(depositAddress, depositAmount);

            await sleep(5000);

            const res = await request(app.getHttpServer()).get('/transfer/all');
            const [deposit] = res.body as Transfer[];

            expect(deposit.id).toBeDefined();

            const withdrawal: RequestWithdrawalDTO = {
                assetId: deposit.asset.id,
                userId: user1Id,
                amount: withdrawalAmount,
                address: withdrawalAddress
            };

            await request(app.getHttpServer())
                .post('/transfer/withdrawal')
                .send(withdrawal)
                .expect(201);

            await sleep(5000);

            const endBalance = (await registry.functions.balanceOf(
                withdrawalAddress,
                1
            )) as ethers.utils.BigNumber;

            expect(endBalance.gt(startBalance)).toBeTruthy();
        });
    });

    describe('Demand orders trading', () => {
        jest.setTimeout(10000);

        const demandOwner = '1';
        const sellerId = '2';
        let sellerAddress: string;

        beforeEach(async () => {
            const { address } = await accountService.getOrCreateAccount(sellerId);
            sellerAddress = address;
        });
        it('should trade the bid from the demand', async () => {
            const validFrom = new Date();

            const deposit = await createDeposit(sellerAddress);
            await confirmDeposit();

            await orderService.createAsk(sellerId, {
                assetId: deposit.asset.id,
                volume: '500',
                price: 1000,
                validFrom: validFrom.toISOString()
            });

            const product = productService.getProduct('deviceId');

            const demand = await demandService.createSingle(
                demandOwner,
                1000,
                '250',
                product,
                validFrom
            );

            await sleep(5000);

            await request(app.getHttpServer())
                .get(`/trade`)
                .expect(200)
                .expect(res => {
                    const trades = res.body as TradeDTO[];

                    expect(trades).toBeDefined();
                    expect(trades).toHaveLength(1);
                    expect(trades[0].askId).toBeUndefined(); // as a buyer, I should not see the askId
                    expect(trades[0].bidId).toBe(demand.bids[0].id);
                });

            await request(app.getHttpServer())
                .get(`/orders`)
                .expect(200)
                .expect(res => {
                    const orders = res.body as OrderDTO[];

                    expect(orders).toBeDefined();
                    expect(orders).toHaveLength(1);
                    expect(orders[0].demandId).toBe(demand.id);
                });
        });
    });

    describe('DirectBuy orders tests', () => {
        it('should allow to buy a selected ask', async () => {
            const validFrom = new Date();
            const sellerId = '2';
            const { address } = await accountService.getOrCreateAccount(sellerId);
            const deposit = await createDeposit(address);
            await confirmDeposit();

            await orderService.createAsk(sellerId, {
                assetId: deposit.asset.id,
                volume: '500',
                price: 1000,
                validFrom: validFrom.toISOString()
            });

            const ask2 = await orderService.createAsk(sellerId, {
                assetId: deposit.asset.id,
                volume: '500',
                price: 2000,
                validFrom: validFrom.toISOString()
            });

            const directBuyOrder: DirectBuyDTO = {
                askId: ask2.id,
                price: ask2.price,
                volume: ask2.startVolume.toString(10)
            };

            let createdDirectBuyOrder: OrderDTO;

            await request(app.getHttpServer())
                .post('/orders/ask/buy')
                .send(directBuyOrder)
                .expect(201)
                .expect(res => {
                    createdDirectBuyOrder = res.body as OrderDTO;

                    expect(createdDirectBuyOrder.type).toBe(OrderType.Direct);
                    expect(createdDirectBuyOrder.price).toBe(directBuyOrder.price);
                    expect(createdDirectBuyOrder.startVolume).toBe(directBuyOrder.volume);
                });

            await sleep(3000);

            await request(app.getHttpServer())
                .get(`/trade`)
                .expect(200)
                .expect(res => {
                    const trades = res.body as TradeDTO[];
                    const [trade] = trades;

                    expect(trades).toBeDefined();
                    expect(trades).toHaveLength(1);
                    expect(trade.bidId).toBe(createdDirectBuyOrder.id);
                    expect(trade.volume).toBe(createdDirectBuyOrder.startVolume);
                });
        });
    });

    afterEach(async () => {
        await app.close();
    });
});
