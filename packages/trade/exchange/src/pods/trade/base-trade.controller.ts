import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
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
import { ApiBearerAuth, ApiExtraModels, ApiResponse, ApiTags, refs } from '@nestjs/swagger';
import { TradeDTO, TradeForAdminDTO } from './trade.dto';
import { TradeService } from './trade.service';

export const BaseTradeControllerGetAllResponse = (...models: Function[]) => {
    return (
        target: object,
        key?: string | symbol,
        descriptor?: TypedPropertyDescriptor<any>
    ): any => {
        ApiExtraModels(...models)(target, key, descriptor);
        ApiResponse({
            status: HttpStatus.OK,
            schema: {
                type: 'array',
                items: {
                    oneOf: refs(...models)
                }
            },
            description: 'Get all trades'
        })(target, key, descriptor);
    };
};

@ApiTags('trade')
@ApiBearerAuth('access-token')
@Controller('trade')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export abstract class BaseTradeController<TProduct, TProductFilter> {
    constructor(private readonly tradeService: TradeService<TProduct, TProductFilter>) {}

    @UseGuards(AuthGuard(), ActiveUserGuard)
    @Get()
    @BaseTradeControllerGetAllResponse(TradeDTO, TradeForAdminDTO)
    public async getAll(
        @UserDecorator() user: ILoggedInUser
    ): Promise<(TradeDTO<TProduct> | TradeForAdminDTO<TProduct>)[]> {
        if (user.hasRole(Role.Admin)) {
            const trades = await this.tradeService.getAll();

            return trades.map((trade) =>
                TradeForAdminDTO.fromTradeForAdmin(trade, trade.ask.asset, trade.ask.product)
            );
        } else {
            const trades = await this.tradeService.getAllByUser(user.ownerId, false);

            return trades.map((trade) =>
                TradeDTO.fromTrade(
                    trade.withMaskedOrder(user.ownerId),
                    trade.ask.assetId,
                    trade.ask.product
                )
            );
        }
    }
}
