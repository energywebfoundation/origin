import {
    AggregateFilterDTO,
    BaseReadsController,
    FilterDTO,
    MeasurementDTO,
    AggregatedReadDTO,
    ReadDTO,
    ReadsService
} from '@energyweb/energy-api-influxdb';
import { Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('meter-reads')
@ApiTags('meter-reads')
export class ReadsController extends BaseReadsController {
    constructor(readsService: ReadsService) {
        super(readsService);
    }

    @Get('/:meter')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [ReadDTO],
        description: 'Returns time-series of meter reads'
    })
    public async getReads(
        @Param('meter') meterId: string,
        @Query() filter: FilterDTO
    ): Promise<ReadDTO[]> {
        return super.getReads(meterId, filter);
    }

    @Get('/:meter/difference')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [ReadDTO],
        description: 'Returns time-series of difference between subsequent meter reads'
    })
    public async getReadsDifference(
        @Param('meter') meterId: string,
        @Query() filter: FilterDTO
    ): Promise<ReadDTO[]> {
        return super.getReadsDifference(meterId, filter);
    }

    @Get('/:meter/aggregate')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [AggregatedReadDTO],
        description: 'Returns aggregated time-series of difference between subsequent meter reads'
    })
    public async getReadsAggregates(
        @Param('meter') meterId: string,
        @Query() filter: AggregateFilterDTO
    ): Promise<AggregatedReadDTO[]> {
        return super.getReadsAggregates(meterId, filter);
    }

    @Post('/:meter')
    @ApiBody({ type: MeasurementDTO })
    @UseGuards(AuthGuard())
    @ApiCreatedResponse({ description: 'Creates meter reads' })
    public async storeReads(
        @Param('meter') meterId: string,
        @Body() measurement: MeasurementDTO
    ): Promise<void> {
        await super.storeReads(meterId, measurement);
    }
}
