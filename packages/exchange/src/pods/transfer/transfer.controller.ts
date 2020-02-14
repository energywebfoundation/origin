import { Controller, Get, Post, Body, ForbiddenException } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { RequestWithdrawalDTO } from './create-withdrawal.dto';

@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Get('all')
    public async getTransfers() {
        return this.transferService.getAll('1');
    }

    @Post('withdrawal')
    public async requestWithdrawal(@Body() withdrawal: RequestWithdrawalDTO) {
        try {
            const result = await this.transferService.requestWithdrawal(withdrawal);

            return result;
        } catch (error) {
            throw new ForbiddenException();
        }
    }
}
