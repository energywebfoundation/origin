import { Controller, Get, Param } from '@nestjs/common';

import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

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
}
