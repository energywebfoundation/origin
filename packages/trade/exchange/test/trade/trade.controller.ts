import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
    BaseTradeController,
    BaseTradeControllerGetAllResponse
} from '../../src/pods/trade/base-trade.controller';
import { TradeDTO, TradeForAdminDTO } from './trade.dto';

@ApiTags('trade')
@ApiBearerAuth('access-token')
@Controller('trade')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class TradeController extends BaseTradeController<string, string> {
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get()
    @BaseTradeControllerGetAllResponse(TradeDTO, TradeForAdminDTO)
    public async getAll(
        @UserDecorator() user: ILoggedInUser
    ): Promise<(TradeDTO | TradeForAdminDTO)[]> {
        return super.getAll(user);
    }
}
