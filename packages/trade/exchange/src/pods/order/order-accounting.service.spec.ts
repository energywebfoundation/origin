import { OrderSide } from '@energyweb/exchange-core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import BN from 'bn.js';

import { Order } from '.';
import { AccountBalanceService } from '../account-balance';
import { Asset } from '../asset/asset.entity';
import { OrderAccountingService } from './order-accounting.service';
import { OrderService } from './order.service';

describe('OrderAccountingService', () => {
    const userId = '1';
    const asset1 = { id: '1', address: '0x1234', tokenId: '0' } as Asset;

    let service: OrderAccountingService<string>;
    let orderService: OrderService<string>;

    const registerOrder = (...orders: Partial<Order>[]) => {
        jest.spyOn(orderService, 'getActiveOrdersBySide').mockImplementation(
            async () => orders as Order[]
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
                    provide: OrderService,
                    useValue: { getActiveOrdersBySide: jest.fn() }
                },
                OrderAccountingService
            ]
        }).compile();

        service = module.get<OrderAccountingService<string>>(OrderAccountingService);
        orderService = module.get<OrderService<string>>(OrderService);
    });

    it('should return asks as available with negative sign', async () => {
        registerOrder({ asset: asset1, side: OrderSide.Ask, currentVolume: new BN(100) });

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(1);

        expect(res[0].amount).toEqual(new BN(-100));
        expect(res[0].asset).toEqual(asset1);
    });
});
