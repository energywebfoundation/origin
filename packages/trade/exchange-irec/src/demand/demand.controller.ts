import { BaseDemandController } from '@energyweb/exchange';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductDTO } from '../product/product.dto';
import { CreateDemandDTO } from './create-demand.dto';
import { DemandSummaryDTO } from './demand-summary.dto';
import { DemandDTO } from './demand.dto';

@ApiTags('demand')
@ApiBearerAuth('access-token')
@Controller('demand')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class DemandController extends BaseDemandController<ProductDTO> {
    @Get('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: DemandDTO, description: 'Get a demand' })
    public async findOne(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        return super.findOne(user, id);
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: [DemandDTO], description: 'Get all demands' })
    public async getAll(@UserDecorator() user: ILoggedInUser): Promise<DemandDTO[]> {
        return super.getAll(user);
    }

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: CreateDemandDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: DemandDTO, description: 'Create a demand' })
    public async create(
        @UserDecorator() user: ILoggedInUser,
        @Body() createDemand: CreateDemandDTO
    ): Promise<DemandDTO> {
        return super.create(user, createDemand);
    }

    @Post('/summary')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiBody({ type: CreateDemandDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: DemandSummaryDTO,
        description: 'Get a demand summary'
    })
    public summary(
        @UserDecorator() user: ILoggedInUser,
        @Body() createDemand: CreateDemandDTO
    ): DemandSummaryDTO {
        return super.summary(user, createDemand);
    }

    @Post('/:id/pause')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: DemandDTO, description: 'Pause a Demand' })
    public async pause(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        return super.pause(user, id);
    }

    @Post('/:id/resume')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: DemandDTO, description: 'Resume a Demand' })
    public async resume(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        return super.resume(user, id);
    }

    @Post('/:id/archive')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiResponse({ status: HttpStatus.ACCEPTED, type: DemandDTO, description: 'Archive a Demand' })
    public async archive(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<DemandDTO> {
        return super.archive(user, id);
    }

    @Post('/:id/replace')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({ type: CreateDemandDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: DemandDTO, description: 'Replace a Demand' })
    public async replace(
        @UserDecorator() user: ILoggedInUser,
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Body() createDemand: CreateDemandDTO
    ): Promise<DemandDTO> {
        return super.replace(user, id, createDemand);
    }
}
