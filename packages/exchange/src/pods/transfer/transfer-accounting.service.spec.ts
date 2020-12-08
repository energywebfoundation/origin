// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import BN from 'bn.js';

import { Transfer, TransferAccountingService, TransferDirection, TransferService } from '.';
import { AccountBalanceService } from '../account-balance';
import { Asset } from '../asset/asset.entity';

describe('TransferAccountingService', () => {
    const userId = '1';
    const asset1 = { id: '1', address: '0x1234', tokenId: '0' } as Asset;
    const asset2 = { id: '2', address: '0x1234', tokenId: '1' } as Asset;

    let service: TransferAccountingService;
    let transferService: TransferService;

    const registerTransfer = (...transfers: Partial<Transfer>[]) => {
        jest.spyOn(transferService, 'getAllCompleted').mockImplementation(
            async () => transfers as Transfer[]
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
                    provide: TransferService,
                    useValue: { getAllCompleted: jest.fn() }
                },
                TransferAccountingService
            ]
        }).compile();

        service = module.get<TransferAccountingService>(TransferAccountingService);
        transferService = module.get<TransferService>(TransferService);
    });

    it('should return deposits as available', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit }
        );

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(2);

        expect(res[0].amount).toEqual(new BN('1000'));
        expect(res[0].asset).toEqual(asset1);

        expect(res[1].amount).toEqual(new BN('2000'));
        expect(res[1].asset).toEqual(asset2);
    });

    it('should return sum of deposits as available', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '3000', direction: TransferDirection.Deposit }
        );

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(2);

        expect(res[0].amount).toEqual(new BN('1000'));
        expect(res[0].asset).toEqual(asset1);

        expect(res[1].amount).toEqual(new BN('5000'));
        expect(res[1].asset).toEqual(asset2);
    });

    it('should return sum of withdrawals as available', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Withdrawal },
            { asset: asset2, amount: '2000', direction: TransferDirection.Withdrawal },
            { asset: asset2, amount: '3000', direction: TransferDirection.Withdrawal }
        );

        const res = Array.from((await service.availableAssets(userId)).values());

        expect(res.length).toBe(2);

        expect(res[0].amount).toEqual(new BN('-1000'));
        expect(res[0].asset).toEqual(asset1);

        expect(res[1].amount).toEqual(new BN('-5000'));
        expect(res[1].asset).toEqual(asset2);
    });

    it('should not return deposits as locked assets', async () => {
        registerTransfer(
            { asset: asset1, amount: '1000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '2000', direction: TransferDirection.Deposit },
            { asset: asset2, amount: '3000', direction: TransferDirection.Deposit }
        );

        const res = Array.from((await service.lockedAssets('1')).values());

        expect(res.length).toBe(0);
    });
});
