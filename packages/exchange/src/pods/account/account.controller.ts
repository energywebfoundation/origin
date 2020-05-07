import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AccountService } from './account.service';
import { Account } from './account';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // TODO: explicit account creation request
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @UseGuards(AuthGuard())
    public async getAccount(@UserDecorator() user: ILoggedInUser): Promise<Account> {
        return this.accountService.getAccount(user.id.toString());
    }
}
