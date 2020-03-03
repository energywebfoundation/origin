import { Contracts } from '@energyweb/issuer';
import {
    CanActivate,
    ExecutionContext,
    INestApplication,
    Logger,
    ValidationPipe
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { Contract, ethers } from 'ethers';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import { EmptyResultInterceptor } from '../src/empty-result.interceptor';
import { Account } from '../src/pods/account/account';
import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { DemandService } from '../src/pods/demand/demand.service';
import { CreateAskDTO } from '../src/pods/order/create-ask.dto';
import { Order } from '../src/pods/order/order.entity';
import { OrderService } from '../src/pods/order/order.service';
import { ProductService } from '../src/pods/product/product.service';
import { TradeDTO } from '../src/pods/trade/trade.dto';
import { RequestWithdrawalDTO } from '../src/pods/transfer/create-withdrawal.dto';
import { TransferDirection } from '../src/pods/transfer/transfer-direction';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { OrderDTO } from 'src/pods/order/order.dto';

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

    // ganache account 2
    const registryDeployer = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';

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

    const deployRegistry = async () => {
        const { abi, bytecode } = Contracts.RegistryJSON;

        const provider = new ethers.providers.JsonRpcProvider(web3);
        const wallet = new ethers.Wallet(registryDeployer, provider);

        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const contract = await factory.deploy();
        await contract.deployed();
        await contract.functions.initialize();

        return contract;
    };

    const authGuard: CanActivate = {
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = { id: 1 };

            return true;
        }
    };

    const testLogger = new Logger('e2e');

    const deviceTypes = [
        ['Solar'],
        ['Solar', 'Photovoltaic'],
        ['Solar', 'Photovoltaic', 'Roof mounted'],
        ['Solar', 'Photovoltaic', 'Ground mounted'],
        ['Solar', 'Photovoltaic', 'Classic silicon'],
        ['Solar', 'Concentration'],
        ['Wind'],
        ['Wind', 'Onshore'],
        ['Wind', 'Offshore'],
        ['Marine'],
        ['Marine', 'Tidal'],
        ['Marine', 'Tidal', 'Inshore'],
        ['Marine', 'Tidal', 'Offshore']
    ];

    beforeEach(async () => {
        registry = await deployRegistry();

        const configService = new ConfigService({
            WEB3: web3,
            // ganache account 0
            EXCHANGE_ACCOUNT_DEPLOYER_PRIV:
                '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5',
            // ganache account 1
            EXCHANGE_WALLET_PUB: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8',
            EXCHANGE_WALLET_PRIV:
                '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3',
            REGISTRY_ADDRESS: registry.address
        });

        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
            providers: [DatabaseService]
        })
            .overrideProvider(ConfigService)
            .useValue(configService)
            .overrideGuard(AuthGuard('default'))
            .useValue(authGuard)
            .compile();

        app = moduleFixture.createNestApplication();

        transferService = await app.resolve<TransferService>(TransferService);
        accountService = await app.resolve<AccountService>(AccountService);
        databaseService = await app.resolve<DatabaseService>(DatabaseService);
        demandService = await app.resolve<DemandService>(DemandService);
        orderService = await app.resolve<OrderService>(OrderService);
        productService = await app.resolve<ProductService>(ProductService);

        const appService = await app.resolve<AppService>(AppService);
        await appService.init(deviceTypes);

        app.useGlobalInterceptors(new EmptyResultInterceptor());
        app.useGlobalPipes(new ValidationPipe());
        app.useLogger(testLogger);

        await app.init();
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
        });
    });

    describe('Deposits using deployed registry', () => {
        let depositAddress: string;

        const provider = new ethers.providers.JsonRpcProvider(web3);
        const tokenReceiverPrivateKey =
            '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
        const tokenReceiver = new ethers.Wallet(tokenReceiverPrivateKey, provider);

        const issueToken = async (to: string, amount: string) => {
            const receipt = await registry.functions.issue(to, '0x0', 100, amount, '0x0');

            return receipt.wait();
        };

        const depositToken = async (to: string, amount: string) => {
            const registryWithUserAsSigner = registry.connect(tokenReceiver);

            const transferReceipt = await registryWithUserAsSigner.functions.safeTransferFrom(
                tokenReceiver.address,
                to,
                1,
                amount,
                '0x0'
            );

            return transferReceipt.wait();
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

            const askOrder = await orderService.createAsk(sellerId, {
                assetId: deposit.asset.id,
                volume: '500',
                price: 1000,
                validFrom: validFrom.toISOString()
            });
            await orderService.submit(askOrder);

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

    afterEach(async () => {
        try {
            await databaseService.cleanUp();
        } catch (error) {
            console.error(error);
        }
        try {
            await app.close();
        } catch (error) {
            console.error(error);
        }
    });
});
