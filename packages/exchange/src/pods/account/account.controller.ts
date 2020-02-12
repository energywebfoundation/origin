import { Controller, Get, Param, Post, Body, ForbiddenException } from '@nestjs/common';

import { AccountService } from './account.service';
import { Account } from './account';
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
    public async getAccount(@Param('id') userId: string): Promise<Account> {
        return this.accountService.getAccount(userId);
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
