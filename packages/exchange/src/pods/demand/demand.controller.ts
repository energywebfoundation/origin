import { IUser } from '@energyweb/origin-backend-core';
import { Controller, Get, Logger, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
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
    @UseGuards(AuthGuard())
    public async findOne(
        @UserDecorator() user: IUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ) {
        return this.demandService.findOne(user.id.toString(), id);
    }

    @Get()
    @UseGuards(AuthGuard())
    public async getAll(@UserDecorator() user: IUser) {
        return this.demandService.getAll(user.id.toString());
    }
}
