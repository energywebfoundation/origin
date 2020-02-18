import { IUser } from '@energyweb/origin-backend-core';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // TODO: explicit account creation request
    @Get()
    @UseGuards(AuthGuard())
    public async getAccount(@UserDecorator() user: IUser): Promise<AccountDTO> {
        const account = await this.accountService.getAccount(user.id.toString());

        return {
            ...account,
            balances: {
                available: account.balances.available.map(b => ({
                    ...b,
                    amount: b.amount.toString(10)
                })),
                locked: account.balances.locked.map(b => ({ ...b, amount: b.amount.toString(10) }))
            }
        };
    }
}
