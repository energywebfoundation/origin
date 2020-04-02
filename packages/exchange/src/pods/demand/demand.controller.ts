import { IUser } from '@energyweb/origin-backend-core';
import {
    Controller,
    Get,
    Logger,
    Param,
    ParseUUIDPipe,
    UseGuards,
    Body,
    Post,
    HttpCode
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserDecorator } from '../decorators/user.decorator';
import { DemandService } from './demand.service';
import { CreateDemandDTO } from './create-demand.dto';

@Controller('demand')
export class DemandController {
    private readonly logger = new Logger(DemandController.name);

    constructor(private readonly demandService: DemandService) {}

    @Get('/:id')
    @UseGuards(AuthGuard())
    public async findOne(
        @UserDecorator() user: IUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ) {
        this.logger.debug(`Requesting demand ${id} from user ${user.id}`);
        const demand = await this.demandService.findOne(user.id.toString(), id);
        return demand;
    }

    @Get()
    @UseGuards(AuthGuard())
    public async getAll(@UserDecorator() user: IUser) {
        return this.demandService.getAll(user.id.toString());
    }

    @Post()
    @UseGuards(AuthGuard())
    public async create(@UserDecorator() user: IUser, @Body() createDemand: CreateDemandDTO) {
        const demand = await this.demandService.create(user.id.toString(), createDemand);
        return demand;
    }

    @Post('/:id/pause')
    @UseGuards(AuthGuard())
    @HttpCode(202)
    public async pause(
        @UserDecorator() user: IUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ) {
        const demand = await this.demandService.pause(user.id.toString(), id);
        return demand;
    }

    @Post('/:id/resume')
    @UseGuards(AuthGuard())
    @HttpCode(202)
    public async resume(
        @UserDecorator() user: IUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ) {
        const demand = await this.demandService.resume(user.id.toString(), id);
        return demand;
    }

    @Post('/:id/archive')
    @UseGuards(AuthGuard())
    @HttpCode(202)
    public async archive(
        @UserDecorator() user: IUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ) {
        const demand = await this.demandService.archive(user.id.toString(), id);
        return demand;
    }
}
