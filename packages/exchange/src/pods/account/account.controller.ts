import { Controller, Get, Param } from '@nestjs/common';

import { Account } from './account';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // TODO: explicit account creation request
    // TODO: id from auth header
    @Get(':id')
    public async getAccount(@Param('id') userId: string): Promise<Account> {
        return this.accountService.getAccount(userId);
    }
}
