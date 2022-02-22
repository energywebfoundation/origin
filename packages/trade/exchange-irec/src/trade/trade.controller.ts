import { BaseTradeController, BaseTradeControllerGetAllResponse } from '@energyweb/exchange';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
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
import { ProductDTO, ProductFilterDTO } from '../product';

import { TradeDTO, TradeForAdminDTO } from './trade.dto';

@ApiTags('trade')
@ApiBearerAuth('access-token')
@Controller('trade')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class TradeController extends BaseTradeController<ProductDTO, ProductFilterDTO> {
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get()
    @BaseTradeControllerGetAllResponse(TradeDTO, TradeForAdminDTO)
    public async getAll(
        @UserDecorator() user: ILoggedInUser
    ): Promise<(TradeDTO | TradeForAdminDTO)[]> {
        return super.getAll(user);
    }
}
