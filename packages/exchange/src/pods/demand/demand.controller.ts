import { Controller, Post, Logger } from '@nestjs/common';
import { DemandService } from './demand.service';

@Controller('demand')
export class DemandController {
    private readonly logger = new Logger(DemandController.name);

    constructor(private readonly demandService: DemandService) {}

    @Post()
    public async test() {
        this.logger.log(`Creating test demand`);
        const demand = await this.demandService.createSingle(
            '1',
            100,
            100,
            { deviceType: ['Solar'] },
            new Date()
        );

        return demand.id;
    }
}
