import { BaseAdminTradeController } from '@energyweb/exchange';
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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductDTO, ProductFilterDTO } from '../product';


@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class AdminTradeController extends BaseAdminTradeController<ProductDTO, ProductFilterDTO> { }
