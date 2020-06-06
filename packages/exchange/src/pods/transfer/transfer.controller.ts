import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RequestWithdrawalDTO } from './create-withdrawal.dto';
import { TransferService } from './transfer.service';

@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Get('all')
    @UseGuards(AuthGuard())
    public async getTransfers(@UserDecorator() { ownerId }: ILoggedInUser) {
        return this.transferService.getAll(ownerId);
    }

    @Post('withdrawal')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin)
    public async requestWithdrawal(
        @UserDecorator() user: ILoggedInUser,
        @Body() withdrawal: RequestWithdrawalDTO
    ) {
        try {
            console.log('>>> TransferController.requestWithdrawal: ', withdrawal);
            const result = await this.transferService.requestWithdrawal(user.ownerId, withdrawal);

            return result;
        } catch (error) {
            throw new ForbiddenException();
        }
    }
}
