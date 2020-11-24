import { UserStatus } from '@energyweb/origin-backend-core';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';

import { AccountDTO } from '../src/pods/account/account.dto';
import { AccountService } from '../src/pods/account/account.service';
import { BundlePublicDTO } from '../src/pods/bundle/bundle-public.dto';
import { BundleSplitDTO } from '../src/pods/bundle/bundle-split.dto';
import { BundleTrade } from '../src/pods/bundle/bundle-trade.entity';
import { Bundle } from '../src/pods/bundle/bundle.entity';
import { BundleService } from '../src/pods/bundle/bundle.service';
import { BuyBundleDTO } from '../src/pods/bundle/buy-bundle.dto';
import { CreateBundleDTO } from '../src/pods/bundle/create-bundle.dto';
import { Transfer } from '../src/pods/transfer/transfer.entity';
import { TransferService } from '../src/pods/transfer/transfer.service';
import { authenticatedUser, bootstrapTestInstance } from './exchange';
import { MWh } from './utils';

describe('Bundles', () => {
    let app: INestApplication;
    let transferService: TransferService;
    let databaseService: DatabaseService;
    let accountService: AccountService;
    let bundleService: BundleService;

    const user1Id = authenticatedUser.organization.id;

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

    const createBundle = async (
        userId: string,
        items = [
            { volume: 10, asset: assetOne },
            { volume: 10, asset: assetTwo }
        ]
    ) => {
        const { address } = await accountService.getOrCreateAccount(userId);

        const deposits: Transfer[] = [];

        for (const item of items) {
            const deposit = await createDeposit(address, `${item.volume * MWh}`, item.asset);
            await confirmDeposit(deposit.transactionHash);

            deposits.push(deposit);
        }

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: deposits.map((deposit) => ({
                assetId: deposit.asset.id,
                volume: deposit.amount
            }))
        };

        return bundleService.create(userId, bundleToCreate);
    };

    const createUnsplittableBundle = async (userId: string) => {
        return createBundle(userId, [
            { volume: 890, asset: assetOne },
            { volume: 10, asset: assetTwo },
            { volume: 1, asset: assetTwo },
            { volume: 17, asset: assetTwo }
        ]);
    };

    before(async () => {
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

    after(async () => {
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
            expect(bundle.items).to.have.length(2);
            expect(bundle.price).equals(bundleToCreate.price);
            expect(bundle.userId).equals(user1Id);
            expect(bundle.available).equals(`${20 * MWh}`);
        };

        await request(app.getHttpServer())
            .post('/bundle')
            .send(bundleToCreate)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                const bundle = res.body as Bundle;

                assertBundle(bundle);
            });

        await request(app.getHttpServer())
            .get('/bundle')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const [bundle] = res.body as Bundle[];

                assertBundle(bundle);
            });

        await request(app.getHttpServer())
            .get('/account')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const {
                    balances: { available, locked }
                } = res.body as AccountDTO;

                expect(locked.length).equals(2);
                expect(available.length).equals(0);

                const itemOne = locked.find((item) => item.asset.id === depositOne.asset.id);
                const itemTwo = locked.find((item) => item.asset.id === depositTwo.asset.id);

                expect(itemOne.amount).equals(`${10 * MWh}`);
                expect(itemTwo.amount).equals(`${10 * MWh}`);
            });
    });

    it('should be able to cancel the bundle', async () => {
        const { id, items } = await createBundle(user1Id);

        await request(app.getHttpServer())
            .put(`/bundle/${id}/cancel`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const bundle = res.body as Bundle;

                expect(bundle.id).equals(id);
                expect(bundle.isCancelled).equals(true);
            });

        await request(app.getHttpServer())
            .get('/account')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const {
                    balances: { available, locked }
                } = res.body as AccountDTO;

                expect(locked.length).equals(0);
                expect(available.length).equals(2);

                const itemOne = available.find((item) => item.asset.id === items[0].asset.id);
                const itemTwo = available.find((item) => item.asset.id === items[1].asset.id);

                expect(itemOne.amount).equals(`${10 * MWh}`);
                expect(itemTwo.amount).equals(`${10 * MWh}`);
            });
    });

    it('should be able to buy part of the bundle', async () => {
        const user2Id = '2';
        const { id, items } = await createBundle(user2Id);

        const bundleToBuy: BuyBundleDTO = {
            bundleId: id,
            volume: `${10 * MWh}`
        };

        await request(app.getHttpServer())
            .put('/bundle/buy')
            .send(bundleToBuy)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trade = res.body as BundleTrade;

                expect(trade.buyerId).equals(user1Id);
                expect(trade.volume).equals(`${10 * MWh}`);
                expect(trade.items).to.have.length(2);

                const itemOne = trade.items.find((item) => item.assetId === items[0].asset.id);
                const itemTwo = trade.items.find((item) => item.assetId === items[1].asset.id);

                expect(itemOne.volume).equals(`${5 * MWh}`);
                expect(itemTwo.volume).equals(`${5 * MWh}`);
            });

        await request(app.getHttpServer())
            .get('/account')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const {
                    balances: { available, locked }
                } = res.body as AccountDTO;

                expect(locked.length).equals(0);
                expect(available.length).equals(2);

                const itemOne = available.find((item) => item.asset.id === items[0].asset.id);
                const itemTwo = available.find((item) => item.asset.id === items[1].asset.id);

                expect(itemOne.amount).equals(`${5 * MWh}`);
                expect(itemTwo.amount).equals(`${5 * MWh}`);
            });

        await request(app.getHttpServer())
            .get('/bundle/trade')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trades = res.body as BundleTrade[];

                expect(trades).to.have.length(1);

                const [trade] = trades;
                expect(trade.bundle.id).equals(id);
                expect(trade.buyerId).equals(user1Id);
            });

        const {
            balances: { available, locked }
        } = await accountService.getAccount(user2Id);

        expect(locked.length).equals(2);
        expect(available.length).equals(0);

        const itemOne = locked.find((item) => item.asset.id === items[0].asset.id);
        const itemTwo = locked.find((item) => item.asset.id === items[1].asset.id);

        expect(itemOne.amount.toString(10)).equals(`${5 * MWh}`);
        expect(itemTwo.amount.toString(10)).equals(`${5 * MWh}`);
    });

    it('should not return cancelled bundles', async () => {
        const bundle1 = await createBundle(user1Id);
        const bundle2 = await createBundle(user1Id);

        await bundleService.cancel(user1Id, bundle1.id);

        await request(app.getHttpServer())
            .get('/bundle/available')
            .expect(HttpStatus.OK)
            .expect((res) => {
                const bundles = res.body as BundlePublicDTO[];

                expect(bundles).to.have.length(1);
                expect(bundles[0].id).equals(bundle2.id);
            });
    });

    it('should return possible bundle splits', async () => {
        const { id } = await createBundle(user1Id);

        await request(app.getHttpServer())
            .get(`/bundle/${id}/splits`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const splits = res.body as BundleSplitDTO;

                expect(splits.id).equals(id);
                expect(splits.splits).to.have.length(10);
                expect(splits.splits[0].volume).to.equal('2000000');
                expect(splits.splits[1].volume).to.equal('4000000');
                expect(splits.splits[2].volume).to.equal('6000000');
                expect(splits.splits[9].volume).to.equal('20000000');
            });
    });

    it('should return split with whole items volums when bundle is unsplittable', async () => {
        const { id } = await createUnsplittableBundle(user1Id);

        await request(app.getHttpServer())
            .get(`/bundle/${id}/splits`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const splits = res.body as BundleSplitDTO;

                expect(splits.id).equals(id);
                expect(splits.splits).to.have.length(1);
                expect(splits.splits[0].volume).to.equal('918000000');
            });
    });

    it('Inactive user should not be able to buy bundle', async () => {
        const user2Id = '2';
        const { id } = await createBundle(user2Id);
        authenticatedUser.status = UserStatus.Pending;
        const bundleToBuy: BuyBundleDTO = {
            bundleId: id,
            volume: `${10 * MWh}`
        };
        await request(app.getHttpServer())
            .put('/bundle/buy')
            .send(bundleToBuy)
            .expect(HttpStatus.PRECONDITION_FAILED);
        authenticatedUser.status = UserStatus.Active;
    });

    it('Active user should be able to buy bundle', async () => {
        const user2Id = '2';
        const { id } = await createBundle(user2Id);
        const bundleToBuy: BuyBundleDTO = {
            bundleId: id,
            volume: `${10 * MWh}`
        };
        await request(app.getHttpServer())
            .put('/bundle/buy')
            .send(bundleToBuy)
            .expect(HttpStatus.OK);
    });

    it('Inactive user should not be able to create bundle', async () => {
        authenticatedUser.status = UserStatus.Pending;
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

        await request(app.getHttpServer())
            .post('/bundle')
            .send(bundleToCreate)
            .expect(HttpStatus.PRECONDITION_FAILED);
        authenticatedUser.status = UserStatus.Active;
    });

    it('should not be able to create a bundle with negative volume', async () => {
        const { address: user1Address } = await accountService.getOrCreateAccount(user1Id);

        const depositOne = await createDeposit(user1Address, `${10 * MWh}`, assetOne);
        const depositTwo = await createDeposit(user1Address, `${10 * MWh}`, assetTwo);

        await confirmDeposit(depositOne.transactionHash);
        await confirmDeposit(depositTwo.transactionHash);

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: [
                { assetId: depositOne.asset.id, volume: `${-20 * MWh}` },
                { assetId: depositTwo.asset.id, volume: `${10 * MWh}` }
            ]
        };

        await request(app.getHttpServer())
            .post('/bundle')
            .send(bundleToCreate)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not be able to create a bundle with decimal volume', async () => {
        const { address: user1Address } = await accountService.getOrCreateAccount(user1Id);

        const depositOne = await createDeposit(user1Address, `${10 * MWh}`, assetOne);
        const depositTwo = await createDeposit(user1Address, `${10 * MWh}`, assetTwo);

        await confirmDeposit(depositOne.transactionHash);
        await confirmDeposit(depositTwo.transactionHash);

        const bundleToCreate: CreateBundleDTO = {
            price: 1000,
            items: [
                { assetId: depositOne.asset.id, volume: `${1.1 * MWh}` },
                { assetId: depositTwo.asset.id, volume: `${10 * MWh}` }
            ]
        };

        await request(app.getHttpServer())
            .post('/bundle')
            .send(bundleToCreate)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not result in decimal volumes', async () => {
        const user2Id = '2';
        const bundle = await createBundle(user2Id, [
            { volume: 150, asset: assetOne },
            { volume: 100, asset: assetTwo }
        ]);

        await request(app.getHttpServer())
            .put('/bundle/buy')
            .send({
                bundleId: bundle.id,
                volume: `${35 * MWh}`
            })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trade = res.body as BundleTrade;

                expect(trade.items).has.length(2);
                expect(trade.items[0].volume).to.be.equal(`${21 * MWh}`);
                expect(trade.items[1].volume).to.be.equal(`${14 * MWh}`);
            });

        await request(app.getHttpServer())
            .put('/bundle/buy')
            .send({
                bundleId: bundle.id,
                volume: `${5 * MWh}`
            })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trade = res.body as BundleTrade;

                expect(trade.items).has.length(2);
                expect(trade.items[0].volume).to.be.equal(`${3 * MWh}`);
                expect(trade.items[1].volume).to.be.equal(`${2 * MWh}`);
            });

        await request(app.getHttpServer())
            .put('/bundle/buy')
            .send({
                bundleId: bundle.id,
                volume: `${10 * MWh}`
            })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const trade = res.body as BundleTrade;

                expect(trade.items).has.length(2);
                expect(trade.items[0].volume).to.be.equal(`${6 * MWh}`);
                expect(trade.items[1].volume).to.be.equal(`${4 * MWh}`);
            });

        const boughtInTotal = 35 + 5 + 10;

        await request(app.getHttpServer())
            .get(`/bundle/available`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const [activeBundle] = res.body as BundlePublicDTO[];

                expect(activeBundle.available).to.be.equal(`${(250 - boughtInTotal) * MWh}`);
                expect(activeBundle.volume).to.be.equal((250 * MWh).toString());
            });
    });
});
