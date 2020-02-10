import { Controller, Get, Param, Post, Body, ForbiddenException } from '@nestjs/common';

import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';
import { RequestWithdrawalDTO } from '../transfer/create-withdrawal.dto';
import { TransferService } from '../transfer/transfer.service';

@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly transferService: TransferService
    ) {}

    // TODO: id from auth header
    @Get(':id')
    public async getAccount(@Param('id') userId: string): Promise<AccountDTO> {
        const account = await this.accountService.getAccount(userId);

        return {
            address: account.address,
            available: account.available.map(a => ({
                ...a,
                amount: a.amount.toString(10)
            })),
            locked: account.locked.map(a => ({
                ...a,
                amount: a.amount.toString(10)
            }))
        };
    }

    @Post('withdrawal')
    public async requestWithdrawal(@Body() withdrawal: RequestWithdrawalDTO) {
        try {
            const result = await this.accountService.requestWithdrawal(withdrawal);

            return result;
        } catch (error) {
            throw new ForbiddenException();
        }
    }

    @Get('transfers')
    public async getTransfers() {
        return this.transferService.getAll('1');
    }
}
