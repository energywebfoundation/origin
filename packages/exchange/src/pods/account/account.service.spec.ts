import { Test, TestingModule } from '@nestjs/testing';
import BN from 'bn.js';

import { Asset } from '../asset/asset.entity';
import { Deposit } from '../deposit/deposit.entity';
import { DepositService } from '../deposit/deposit.service';
import { Order } from '../order/order.entity';
import { Trade } from '../trade/trade.entity';
import { TradeService } from '../trade/trade.service';
import { AccountService } from './account.service';

jest.mock('../trade/trade.service');
jest.mock('../deposit/deposit.service');

describe('AccountService', () => {
    const userId = '1';
    const asset1 = { id: '1', address: '0x1234', tokenId: '0' } as Asset;
    const asset2 = { id: '2', address: '0x1234', tokenId: '1' } as Asset;

    let service: AccountService;
    let tradeService: TradeService;
    let depositService: DepositService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccountService, TradeService, DepositService]
        }).compile();

        service = module.get<AccountService>(AccountService);
        tradeService = module.get<TradeService>(TradeService);
        depositService = module.get<DepositService>(DepositService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return deposits as available', async () => {
        const deposit1 = new Deposit();
        deposit1.asset = asset1;
        deposit1.amount = '1000';

        const deposit2 = new Deposit();
        deposit2.asset = asset2;
        deposit2.amount = '2000';

        jest.spyOn(depositService, 'getAll').mockImplementation(async () => [deposit1, deposit2]);
        jest.spyOn(tradeService, 'getAll').mockImplementation(async () => []);

        const res = await service.get('1');

        expect(res.available.length).toBe(2);

        expect(res.available[0].amount).toEqual(new BN('1000'));
        expect(res.available[0].asset).toEqual(asset1);

        expect(res.available[1].amount).toEqual(new BN('2000'));
        expect(res.available[1].asset).toEqual(asset2);
    });

    it('should return sum of deposits as available', async () => {
        const deposit1 = new Deposit();
        deposit1.asset = asset1;
        deposit1.amount = '1000';

        const deposit2 = new Deposit();
        deposit2.asset = asset2;
        deposit2.amount = '2000';

        const deposit3 = new Deposit();
        deposit3.asset = asset2;
        deposit3.amount = '3000';

        jest.spyOn(depositService, 'getAll').mockImplementation(async () => [
            deposit1,
            deposit2,
            deposit3
        ]);

        jest.spyOn(tradeService, 'getAll').mockImplementation(async () => []);

        const res = await service.get('1');

        expect(res.available.length).toBe(2);

        expect(res.available[0].amount).toEqual(new BN('1000'));
        expect(res.available[0].asset).toEqual(asset1);

        expect(res.available[1].amount).toEqual(new BN('5000'));
        expect(res.available[1].asset).toEqual(asset2);
    });

    it('should return sum of deposits and trades as available', async () => {
        const deposit1 = new Deposit();
        deposit1.asset = asset1;
        deposit1.amount = '1000';

        const deposit2 = new Deposit();
        deposit2.asset = asset2;
        deposit2.amount = '2000';

        const deposit3 = new Deposit();
        deposit3.asset = asset2;
        deposit3.amount = '3000';

        jest.spyOn(depositService, 'getAll').mockImplementation(async () => [
            deposit1,
            deposit2,
            deposit3
        ]);

        const soldAsset1 = new Trade();
        soldAsset1.ask = { asset: asset1, userId } as Order;
        soldAsset1.volume = 500;

        const boughtAsset2 = new Trade();
        boughtAsset2.ask = { asset: asset2 } as Order;
        boughtAsset2.bid = { userId } as Order;
        boughtAsset2.volume = 1000;

        jest.spyOn(tradeService, 'getAll').mockImplementation(async () => [
            soldAsset1,
            boughtAsset2
        ]);

        const res = await service.get(userId);

        const expectedAsset1Amount = 1000 - 500;
        const expectedAsset2Amount = 2000 + 3000 + 1000;

        expect(res.available.length).toBe(2);

        expect(res.available[0].amount).toEqual(new BN(expectedAsset1Amount));
        expect(res.available[0].asset).toEqual(asset1);

        expect(res.available[1].amount).toEqual(new BN(expectedAsset2Amount));
        expect(res.available[1].asset).toEqual(asset2);
    });
});
