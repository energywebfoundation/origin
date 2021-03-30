import { beforeEach, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import BN from 'bn.js';
import { plainToClass } from 'class-transformer';

import { Bundle, BundleItem, BundleTrade } from '.';
import { AccountBalanceService } from '../account-balance';
import { Asset } from '../asset/asset.entity';
import { BundleAccountingService } from './bundle-accounting.service';
import { BundleService } from './bundle.service';

describe('BundleAccountingService', () => {
    const userId = '1';
    const asset1 = { id: '1', address: '0x1234', tokenId: '0' } as Asset;
    const asset2 = { id: '2', address: '0x1234', tokenId: '1' } as Asset;

    let service: BundleAccountingService;
    let bundleService: BundleService;

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
                    provide: AccountBalanceService,
                    useValue: { registerAssetSource: jest.fn() }
                },
                {
                    provide: BundleService,
                    useValue: { getTrades: jest.fn(), getByUser: jest.fn() }
                },
                BundleAccountingService
            ]
        }).compile();

        service = module.get<BundleAccountingService>(BundleAccountingService);
        bundleService = module.get<BundleService>(BundleService);
    });

    it('should return asset in bundles as locked', async () => {
        registerBundles(
            {
                items: [
                    {
                        asset: asset1,
                        currentVolume: new BN('1000'),
                        startVolume: new BN('1000')
                    } as BundleItem,
                    {
                        asset: asset2,
                        currentVolume: new BN('500'),
                        startVolume: new BN('500')
                    } as BundleItem
                ]
            },
            {
                items: [
                    {
                        asset: asset1,
                        currentVolume: new BN('250'),
                        startVolume: new BN('250')
                    } as BundleItem,
                    {
                        asset: asset2,
                        currentVolume: new BN('500'),
                        startVolume: new BN('500')
                    } as BundleItem
                ]
            }
        );

        const res = Array.from((await service.lockedAssets(userId)).values());

        expect(res.length).toBe(2);
        const [assetOne, assetTwo] = res;

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

        registerBundles();
        registerBundleTrades(trade1, trade2);

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(2);
        const [assetOne, assetTwo] = res;

        expect(assetOne.asset).toEqual(asset1);
        expect(assetOne.amount).toEqual(new BN(20 + 5));

        expect(assetTwo.asset).toEqual(asset2);
        expect(assetTwo.amount).toEqual(new BN(40 + 5));
    });
});
