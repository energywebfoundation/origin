import { IUser } from '@energyweb/origin-backend-core';
import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ensureUser } from '../../utils/validationHelpers';
import { UserDecorator } from '../decorators/user.decorator';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';
import { TransferService } from './transfer.service';

@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Get('all')
    @UseGuards(AuthGuard())
    public async getTransfers(@UserDecorator() user: IUser) {
        return this.transferService.getAll(user.id.toString());
    }

    @Post('withdrawal')
    @UseGuards(AuthGuard())
    public async requestWithdrawal(
        @UserDecorator() user: IUser,
        @Body() withdrawal: RequestWithdrawalDTO
    ) {
        ensureUser(withdrawal, user);

        try {
            const result = await this.transferService.requestWithdrawal(withdrawal);

            return result;
        } catch (error) {
            throw new ForbiddenException();
        }
    }
}
