import { Controller, Get } from '@nestjs/common';
import { TransferService } from './transfer.service';

@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Get('all')
    public async getTransfers() {
        return this.transferService.getAll('1');
    }
}
