import { Controller, Get, Post } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Get()
    public getAccount() {
        return this.accountService.getAccountAssets('1');
    }

    @Post()
    public createAccount() {
        this.accountService.createAccount('1');
    }
}
