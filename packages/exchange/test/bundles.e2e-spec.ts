import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AccountService } from '../src/pods/account/account.service';
import { Bundle } from '../src/pods/bundle/bundle.entity';
import { BundleService } from '../src/pods/bundle/bundle.service';
import { CreateBundleDTO } from '../src/pods/bundle/create-bundle.dto';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { DatabaseService } from './database.service';
import { bootstrapTestInstance } from './exchange';
import { BuyBundleDTO } from '../src/pods/bundle/buy-bundle.dto';
import { BundleTrade } from '../src/pods/bundle/bundle-trade.entity';
import { AccountDTO } from '../src/pods/account/account.dto';

describe('Bundles', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let bundleService: BundleService;

    const user1Id = '1';
    const MWh = 10 ** 6;

    const assetOne = {
        address: '0x9876',
        tokenId: '0',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const assetTwo = {
        address: '0x9876',
        tokenId: '1',
        deviceId: '0',
        generationFrom: new Date('2020-01-01'),
        generationTo: new Date('2020-01-31')
    };

    const createTransactionHash = () => `0x${((Math.random() * 0xffffff) << 0).toString(16)}`;

    const createDeposit = (address: string, amount = '1000', asset = assetOne) => {
        return transferService.createDeposit({
            address,
            transactionHash: createTransactionHash(),
            amount,
            asset
        });
    };

    const confirmDeposit = (transactionHash: string) => {
        return transferService.setAsConfirmed(transactionHash, 10000);
    };

    beforeAll(async () => {
        ({
            transferService,
            accountService,
            databaseService,
            bundleService,
            app
        } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await databaseService.cleanUp();
    });

    it('should be able to create a bundle', async () => {
        const { address: user1Address } = await accountService.getOrCreateAccount(user1Id);

        const depositOne = await createDeposit(user1Address, `${10 * MWh}`, assetOne);
        const depositTwo = await createDeposit(user1Address, `${10 * MWh}`, assetTwo);

        await confirmDeposit(depositOne.transactionHash);
        await confirmDeposit(depositTwo.transactionHash);

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: [
                { assetId: depositOne.asset.id, volume: `${10 * MWh}` },
                { assetId: depositTwo.asset.id, volume: `${10 * MWh}` }
            ]
        };

        const assertBundle = (bundle: Bundle) => {
            expect(bundle).toBeDefined();
            expect(bundle.items).toHaveLength(2);
            expect(bundle.price).toBe(bundleToCreate.price);
            expect(bundle.userId).toBe(user1Id);
            expect(bundle.available).toBe(`${20 * MWh}`);
        };

        await request(app.getHttpServer())
            .post('/bundle')
            .send(bundleToCreate)
            .expect(201)
            .expect((res) => {
                const bundle = res.body as Bundle;

                assertBundle(bundle);
            });

        await request(app.getHttpServer())
            .get('/bundle')
            .expect(200)
            .expect((res) => {
                const [bundle] = res.body as Bundle[];

                assertBundle(bundle);
            });
    });

    it('should be able to cancel the bundle', async () => {
        const { address: user1Address } = await accountService.getOrCreateAccount(user1Id);

        const depositOne = await createDeposit(user1Address, `${10 * MWh}`, assetOne);
        const depositTwo = await createDeposit(user1Address, `${10 * MWh}`, assetTwo);

        await confirmDeposit(depositOne.transactionHash);
        await confirmDeposit(depositTwo.transactionHash);

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: [
                { assetId: depositOne.asset.id, volume: `${10 * MWh}` },
                { assetId: depositTwo.asset.id, volume: `${10 * MWh}` }
            ]
        };

        let bundleId: string;

        await request(app.getHttpServer())
            .post('/bundle')
            .send(bundleToCreate)
            .expect(201)
            .expect((res) => {
                const bundle = res.body as Bundle;

                bundleId = bundle.id;
            });

        await request(app.getHttpServer())
            .put(`/bundle/${bundleId}/cancel`)
            .expect(200)
            .expect((res) => {
                const bundle = res.body as Bundle;

                expect(bundle.id).toBe(bundleId);
                expect(bundle.isCancelled).toBe(true);
            });
    });

    it('should be able to buy part of the bundle', async () => {
        const user2Id = '2';
        const { address: user2Address } = await accountService.getOrCreateAccount(user2Id);
        const depositOne = await createDeposit(user2Address, `${10 * MWh}`, assetOne);
        const depositTwo = await createDeposit(user2Address, `${10 * MWh}`, assetTwo);

        await confirmDeposit(depositOne.transactionHash);
        await confirmDeposit(depositTwo.transactionHash);

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: [
                { assetId: depositOne.asset.id, volume: `${10 * MWh}` },
                { assetId: depositTwo.asset.id, volume: `${10 * MWh}` }
            ]
        };

        const bundle = await bundleService.create(user2Id, bundleToCreate);

        const bundleToBuy: BuyBundleDTO = {
            bundleId: bundle.id,
            volume: `${10 * MWh}`
        };

        await request(app.getHttpServer())
            .post('/bundle/buy')
            .send(bundleToBuy)
            .expect(201)
            .expect((res) => {
                const trade = res.body as BundleTrade;

                expect(trade).toBeDefined();
                expect(trade.buyerId).toBe('1');
                expect(trade.volume).toBe(`${10 * MWh}`);
                expect(trade.items).toHaveLength(2);

                const itemOne = trade.items.find((item) => item.assetId === depositOne.asset.id);
                const itemTwo = trade.items.find((item) => item.assetId === depositTwo.asset.id);

                expect(itemOne.volume).toBe(`${5 * MWh}`);
                expect(itemTwo.volume).toBe(`${5 * MWh}`);
            });

        await request(app.getHttpServer())
            .get('/account')
            .expect(200)
            .expect((res) => {
                const {
                    balances: { available }
                } = res.body as AccountDTO;

                expect(available.length).toBe(2);

                const itemOne = available.find((item) => item.asset.id === depositOne.asset.id);
                const itemTwo = available.find((item) => item.asset.id === depositTwo.asset.id);

                expect(itemOne.amount).toBe(`${5 * MWh}`);
                expect(itemTwo.amount).toBe(`${5 * MWh}`);
            });
    });

    it('should not return cancelled bundles', async () => {
        const { address: user1Address } = await accountService.getOrCreateAccount(user1Id);

        const depositOne = await createDeposit(user1Address, `${10 * MWh}`, assetOne);
        const depositTwo = await createDeposit(user1Address, `${10 * MWh}`, assetTwo);

        await confirmDeposit(depositOne.transactionHash);
        await confirmDeposit(depositTwo.transactionHash);

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: [
                { assetId: depositOne.asset.id, volume: `${5 * MWh}` },
                { assetId: depositTwo.asset.id, volume: `${5 * MWh}` }
            ]
        };

        const bundle1 = await bundleService.create(user1Id, bundleToCreate);
        const bundle2 = await bundleService.create(user1Id, bundleToCreate);

        await bundleService.cancel(user1Id, bundle1.id);

        await request(app.getHttpServer())
            .get('/bundle/available')
            .expect(200)
            .expect((res) => {
                const bundles = res.body as Bundle[];

                expect(bundles).toHaveLength(1);
                expect(bundles[0].id).toBe(bundle2.id);
            });
    });
});
