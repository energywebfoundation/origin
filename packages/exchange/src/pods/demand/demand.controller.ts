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
    HttpStatus,
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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ForbiddenActionError } from '../../utils/exceptions';
import { CreateDemandDTO } from './create-demand.dto';
import { DemandSummaryDTO } from './demand-summary.dto';
import { DemandDTO } from './demand.dto';
import { DemandService } from './demand.service';

@ApiTags('demand')
@ApiBearerAuth('access-token')
@Controller('demand')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class DemandController {
    private readonly logger = new Logger(DemandController.name);

    constructor(private readonly demandService: DemandService) {}

    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: DemandDTO, description: 'Get a demand' })
    public async findOne(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        this.logger.debug(`Requested demand ${id} from userId=${userId} with ownerId=${ownerId}`);
        const demand = await this.demandService.findOne(ownerId, id);
        return demand;
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: [DemandDTO], description: 'Get all demands' })
    public async getAll(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser
    ): Promise<DemandDTO[]> {
        this.logger.debug(`Requested all demands from userId=${userId} with ownerId=${ownerId}`);

        return this.demandService.getAll(ownerId);
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.CREATED, type: DemandDTO, description: 'Create a demand' })
    public async create(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Body() createDemand: CreateDemandDTO
    ): Promise<DemandDTO> {
        this.logger.debug(
            `Requested demand creation from userId=${userId} with ownerId=${ownerId}`
        );

        return this.demandService.create(ownerId, createDemand);
    }

    @Post('/summary')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: DemandSummaryDTO,
        description: 'Get a demand summary'
    })
    public summary(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Body() createDemand: CreateDemandDTO
    ): DemandSummaryDTO {
        this.logger.debug(`Requested demand summary from userId=${userId} with ownerId=${ownerId}`);

        return this.demandService.createSummary(createDemand);
    }

    @Post('/:id/pause')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: DemandDTO, description: 'Pause a Demand' })
    public async pause(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        this.logger.debug(`Requested demand pause from userId=${userId} with ownerId=${ownerId}`);

        const demand = await this.demandService.pause(ownerId, id);
        return demand;
    }

    @Post('/:id/resume')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: DemandDTO, description: 'Resume a Demand' })
    public async resume(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
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
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: DemandDTO, description: 'Archive a Demand' })
    public async archive(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        this.logger.debug(
            `Requested demand archival from userId=${userId} with ownerId=${ownerId}`
        );

        const demand = await this.demandService.archive(ownerId, id);
        return demand;
    }

    @Post('/:id/replace')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({ status: HttpStatus.CREATED, type: DemandDTO, description: 'Replace a Demand' })
    public async replace(
        @UserDecorator() { id: userId, ownerId }: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Body() createDemand: CreateDemandDTO
    ): Promise<DemandDTO> {
        this.logger.debug(
            `Requested demand archival from userId=${userId} with ownerId=${ownerId}`
        );

        const demand = await this.demandService.replace(ownerId, id, createDemand);
        return demand;
    }
}
