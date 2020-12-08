// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import BN from 'bn.js';

import { Trade, TradeAccountingService, TradeService } from '.';
import { AccountBalanceService } from '../account-balance';
import { Asset } from '../asset/asset.entity';
import { Order } from '../order';

// eslint-disable-next-line import/no-extraneous-dependencies
describe('TradeAccountingService', () => {
    const userId = '1';
    const asset1 = { id: '1', address: '0x1234', tokenId: '0' } as Asset;

    let service: TradeAccountingService;
    let tradeService: TradeService;

    const registerTrade = (...trades: Partial<Trade>[]) => {
        jest.spyOn(tradeService, 'getAllByUser').mockImplementation(async () => trades as Trade[]);
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: AccountBalanceService,
                    useValue: { registerAssetSource: jest.fn() }
                },
                {
                    provide: TradeService,
                    useValue: { getAllByUser: jest.fn() }
                },
                TradeAccountingService
            ]
        }).compile();

        service = module.get<TradeAccountingService>(TradeAccountingService);
        tradeService = module.get<TradeService>(TradeService);

        registerTrade();
    });

    it('when seller should return trades as available with negative sign', async () => {
        registerTrade({ ask: { asset: asset1, userId } as Order, volume: new BN(500) });

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(1);

        expect(res[0].amount).toEqual(new BN('-500'));
        expect(res[0].asset).toEqual(asset1);
    });

    it('when buyer should return trades as available', async () => {
        registerTrade({
            bid: { asset: asset1, userId } as Order,
            ask: { asset: asset1 } as Order,
            volume: new BN(500)
        });

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(1);

        expect(res[0].amount).toEqual(new BN('500'));
        expect(res[0].asset).toEqual(asset1);
    });

    it('when bought and sold should not return as available', async () => {
        registerTrade(
            {
                bid: { asset: asset1, userId } as Order,
                ask: { asset: asset1 } as Order,
                volume: new BN(500)
            },
            { ask: { asset: asset1, userId } as Order, volume: new BN(500) }
        );
        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(0);
    });
});
