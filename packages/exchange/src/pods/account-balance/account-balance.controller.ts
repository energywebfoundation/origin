import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AccountBalance } from './account-balance';
import { AccountBalanceService } from './account-balance.service';

@Controller('account-balance')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class AccountBalanceController {
    constructor(private readonly accountBalanceService: AccountBalanceService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async get(@UserDecorator() user: ILoggedInUser): Promise<AccountBalance> {
        return this.accountBalanceService.getAccountBalance(user.ownerId);
    }
}
