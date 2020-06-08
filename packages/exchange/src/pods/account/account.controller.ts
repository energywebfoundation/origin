import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { UserDecorator, UserGuard } from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // TODO: explicit account creation request
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @UseGuards(AuthGuard(), UserGuard)
    public async getAccount(@UserDecorator() user: ILoggedInUser): Promise<AccountDTO> {
        const account = await this.accountService.getAccount(user.ownerId.toString());

        return account;
    }
}
