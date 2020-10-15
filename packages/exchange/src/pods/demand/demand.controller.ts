import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    Logger,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ForbiddenActionError } from '../../utils/exceptions';
import { CreateDemandDTO } from './create-demand.dto';
import { DemandSummaryDTO } from './demand-summary.dto';
import { Demand } from './demand.entity';
import { DemandService } from './demand.service';

@Controller('demand')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class DemandController {
    private readonly logger = new Logger(DemandController.name);

    constructor(private readonly demandService: DemandService) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async findOne(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<Demand> {
        this.logger.debug(`Requested demand ${id} from userId=${userId} with ownerId=${ownerId}`);
        const demand = await this.demandService.findOne(ownerId, id);
        return demand;
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async getAll(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser
    ): Promise<Demand[]> {
        this.logger.debug(`Requested all demands from userId=${userId} with ownerId=${ownerId}`);

        return this.demandService.getAll(ownerId);
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async create(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Body() createDemand: CreateDemandDTO
    ): Promise<Demand> {
        this.logger.debug(
            `Requested demand creation from userId=${userId} with ownerId=${ownerId}`
        );

        const demand = await this.demandService.create(ownerId, createDemand);
        return demand;
    }

    @Post('/summary')
    @HttpCode(200)
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public summary(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Body() createDemand: CreateDemandDTO
    ): DemandSummaryDTO {
        this.logger.debug(`Requested demand summary from userId=${userId} with ownerId=${ownerId}`);

        return this.demandService.createSummary(createDemand);
    }

    @Post('/:id/pause')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(202)
    public async pause(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<Demand> {
        this.logger.debug(`Requested demand pause from userId=${userId} with ownerId=${ownerId}`);

        const demand = await this.demandService.pause(ownerId, id);
        return demand;
    }

    @Post('/:id/resume')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(202)
    public async resume(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<Demand> {
        this.logger.debug(`Requested demand resume from userId=${userId} with ownerId=${ownerId}`);

        try {
            const demand = await this.demandService.resume(ownerId, id);
            return demand;
        } catch (error) {
            if (error instanceof ForbiddenActionError) {
                throw new ForbiddenException();
            }
            throw error;
        }
    }

    @Post('/:id/archive')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(202)
    public async archive(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<Demand> {
        this.logger.debug(
            `Requested demand archival from userId=${userId} with ownerId=${ownerId}`
        );

        const demand = await this.demandService.archive(ownerId, id);
        return demand;
    }
}
