import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BaseTradeController } from '../../src/pods/trade/base-trade.controller';
import { TradeDTO } from './trade.dto';

@ApiTags('trade')
@ApiBearerAuth('access-token')
@Controller('trade')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class TradeController extends BaseTradeController<string, string> {
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get()
    @ApiResponse({ status: HttpStatus.OK, type: [TradeDTO], description: 'Get all trades' })
    public async getAll(@UserDecorator() user: ILoggedInUser): Promise<TradeDTO[]> {
        return super.getAll(user);
    }
}
