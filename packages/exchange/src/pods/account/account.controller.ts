import { IUser } from '@energyweb/origin-backend-core';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { Account } from './account';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // TODO: explicit account creation request
    @Get()
    @UseGuards(AuthGuard())
    public async getAccount(@UserDecorator() user: IUser): Promise<Account> {
        return this.accountService.getAccount(user.id.toString());
    }
}
