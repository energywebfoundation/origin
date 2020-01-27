import { Controller, Post, Logger, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { DemandService } from './demand.service';

@Controller('demand')
export class DemandController {
    private readonly logger = new Logger(DemandController.name);

    constructor(private readonly demandService: DemandService) {}

    @Post()
    public async test() {
        this.logger.log(`Creating test demand`);
        const demand = await this.demandService.createSingle(
            '2',
            100,
            100,
            { deviceType: ['Solar'] },
            new Date()
        );

        return demand.id;
    }

    @Get(':id')
    public async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
        return this.demandService.findOne('2', id);
    }

    @Get()
    public async getAll() {
        return this.demandService.getAll('2');
    }
}
