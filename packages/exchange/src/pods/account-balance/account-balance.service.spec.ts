import { OrderSide } from '@energyweb/exchange-core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import BN from 'bn.js';
import { plainToClass } from 'class-transformer';

import { Asset } from '../asset/asset.entity';
import { BundleItem } from '../bundle/bundle-item.entity';
import { BundleTrade } from '../bundle/bundle-trade.entity';
import { Bundle } from '../bundle/bundle.entity';
import { BundleService } from '../bundle/bundle.service';
import { Order } from '../order/order.entity';
import { OrderService } from '../order/order.service';
import { Trade } from '../trade/trade.entity';
import { TradeService } from '../trade/trade.service';
import { TransferDirection } from '../transfer/transfer-direction';
import { Transfer } from '../transfer/transfer.entity';
import { TransferService } from '../transfer/transfer.service';
import { AccountBalanceService } from './account-balance.service';

describe('AccountBalanceService', () => {
    const userId = '1';
    const asset1 = { id: '1', address: '0x1234', tokenId: '0' } as Asset;
    const asset2 = { id: '2', address: '0x1234', tokenId: '1' } as Asset;

    let service: AccountBalanceService;
    let tradeService: TradeService;
    let transferService: TransferService;
    let orderService: OrderService;
    let bundleService: BundleService;

    const registerTransfer = (...transfers: Partial<Transfer>[]) => {
        jest.spyOn(transferService, 'getAllCompleted').mockImplementation(
            async () => transfers as Transfer[]
        );
    };

    const registerTrade = (...trades: Partial<Trade>[]) => {
        jest.spyOn(tradeService, 'getAllByUser').mockImplementation(async () => trades as Trade[]);
    };

    const registerOrder = (...orders: Partial<Order>[]) => {
        jest.spyOn(orderService, 'getActiveOrdersBySide').mockImplementation(
            async () => orders as Order[]
        );
    };

    const registerBundles = (...bundles: Partial<Bundle>[]) => {
        jest.spyOn(bundleService, 'getByUser').mockImplementation(async () => bundles as Bundle[]);
    };

    const registerBundleTrades = (...trades: Partial<BundleTrade>[]) => {
        jest.spyOn(bundleService, 'getTrades').mockImplementation(
            async () => trades as BundleTrade[]
        );
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: TradeService,
                    useValue: { getAllByUser: jest.fn() }
                },
                {
                    provide: TransferService,
                    useValue: { getAllCompleted: jest.fn() }
                },
                {
                    provide: OrderService,
                    useValue: { getActiveOrdersBySide: jest.fn() }
                },
                {
                    provide: BundleService,
                    useValue: { getTrades: jest.fn(), getByUser: jest.fn() }
                },
                AccountBalanceService
            ]
        }).compile();

        service = module.get<AccountBalanceService>(AccountBalanceService);
        tradeService = module.get<TradeService>(TradeService);
        transferService = module.get<TransferService>(TransferService);
        orderService = module.get<OrderService>(OrderService);
        bundleService = module.get<BundleService>(BundleService);

        registerTransfer();
        registerTrade();
        registerOrder();
        registerBundles();
        registerBundleTrades();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return deposits as available', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit }
        );

        const res = await service.getAccountBalance('1');

        expect(res.available.length).toBe(2);

        expect(res.available[0].amount).toEqual(new BN('1000'));
        expect(res.available[0].asset).toEqual(asset1);

        expect(res.available[1].amount).toEqual(new BN('2000'));
        expect(res.available[1].asset).toEqual(asset2);
    });

    it('should return sum of deposits as available', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '3000', direction: TransferDirection.Deposit }
        );

        const res = await service.getAccountBalance('1');

        expect(res.available.length).toBe(2);

        expect(res.available[0].amount).toEqual(new BN('1000'));
        expect(res.available[0].asset).toEqual(asset1);

        expect(res.available[1].amount).toEqual(new BN('5000'));
        expect(res.available[1].asset).toEqual(asset2);
    });

    it('should return sum of deposits and trades as available', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '3000', direction: TransferDirection.Deposit }
        );

        registerTrade(
            { ask: { asset: asset1, userId } as Order, volume: new BN(500) },
            { ask: { asset: asset2 } as Order, bid: { userId } as Order, volume: new BN(1000) }
        );

        const res = await service.getAccountBalance(userId);

        const expectedAsset1Amount = 1000 - 500;
        const expectedAsset2Amount = 2000 + 3000 + 1000;

        expect(res.available.length).toBe(2);

        expect(res.available[0].amount).toEqual(new BN(expectedAsset1Amount));
        expect(res.available[0].asset).toEqual(asset1);

        expect(res.available[1].amount).toEqual(new BN(expectedAsset2Amount));
        expect(res.available[1].asset).toEqual(asset2);
    });

    it('should return sum of deposits, trades and active sell orders as available for single asset', async () => {
        registerTransfer({ asset: asset1, amount: '1000', direction: TransferDirection.Deposit });

        registerTrade({ ask: { asset: asset1, userId } as Order, volume: new BN(500) });

        registerOrder({ asset: asset1, side: OrderSide.Ask, currentVolume: new BN(100) });

        const res = await service.getAccountBalance(userId);

        const expectedAsset1Amount = 1000 - 500 - 100;

        expect(res.available.length).toBe(1);

        expect(res.available[0].amount).toEqual(new BN(expectedAsset1Amount));
        expect(res.available[0].asset).toEqual(asset1);
    });

    it('should return sum of deposits, trades and active sell orders as available for multiple assets', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset1, amount: '500', direction: TransferDirection.Withdrawal },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '1000', direction: TransferDirection.Withdrawal }
        );

        registerTrade(
            { ask: { asset: asset1, userId } as Order, volume: new BN(400) },
            { ask: { asset: asset2, userId } as Order, volume: new BN(1000) }
        );

        registerOrder({ asset: asset1, side: OrderSide.Ask, currentVolume: new BN(100) });

        const res = await service.getAccountBalance(userId);

        expect(res.available.length).toBe(0);
        expect(res.locked.length).toBe(1);

        expect(res.locked[0].amount).toEqual(new BN(100));
        expect(res.locked[0].asset).toEqual(asset1);
    });

    it('should return locked asset amount', async () => {
        registerTransfer({ asset: asset1, amount: '1000', direction: TransferDirection.Deposit });
        registerOrder({ asset: asset1, side: OrderSide.Ask, currentVolume: new BN(1000) });

        const res = await service.getAccountBalance(userId);

        expect(res.locked.length).toBe(1);
        expect(res.locked[0].asset).toEqual(asset1);
        expect(res.locked[0].amount).toEqual(new BN(1000));
    });

    it('should return asset in bundles as locked', async () => {
        registerBundles(
            {
                items: [
                    { asset: asset1, currentVolume: new BN('1000') } as BundleItem,
                    { asset: asset2, currentVolume: new BN('500') } as BundleItem
                ]
            },
            {
                items: [
                    { asset: asset1, currentVolume: new BN('250') } as BundleItem,
                    { asset: asset2, currentVolume: new BN('500') } as BundleItem
                ]
            }
        );

        const res = await service.getAccountBalance(userId);

        expect(res.locked.length).toBe(2);
        const [assetOne, assetTwo] = res.locked;

        expect(assetOne.asset).toEqual(asset1);
        expect(assetOne.amount).toEqual(new BN(1250));

        expect(assetTwo.asset).toEqual(asset2);
        expect(assetTwo.amount).toEqual(new BN(1000));
    });

    it('should return asset from bundles as available', async () => {
        const trade1 = plainToClass(BundleTrade, {
            volume: new BN('60'),
            bundle: plainToClass(Bundle, {
                items: [
                    {
                        asset: asset1,
                        startVolume: new BN('100'),
                        currentVolume: new BN('100')
                    },
                    {
                        asset: asset2,
                        startVolume: new BN('200'),
                        currentVolume: new BN('200')
                    }
                ]
            })
        });

        const trade2 = plainToClass(BundleTrade, {
            volume: new BN('10'),
            bundle: plainToClass(Bundle, {
                items: [
                    {
                        asset: asset1,
                        startVolume: new BN('50'),
                        currentVolume: new BN('50')
                    },
                    {
                        asset: asset2,
                        startVolume: new BN('50'),
                        currentVolume: new BN('50')
                    }
                ]
            })
        });

        registerBundleTrades(trade1, trade2);

        const res = await service.getAccountBalance(userId);

        expect(res.available.length).toBe(2);
        const [assetOne, assetTwo] = res.available;

        expect(assetOne.asset).toEqual(asset1);
        expect(assetOne.amount).toEqual(new BN(20 + 5));

        expect(assetTwo.asset).toEqual(asset2);
        expect(assetTwo.amount).toEqual(new BN(40 + 5));
    });
});
