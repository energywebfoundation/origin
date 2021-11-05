import { BaseAdminTradeController } from '@energyweb/exchange';
import { NullOrUndefinedResultInterceptor } from '@energyweb/origin-backend-utils';
import {
    Controller,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductDTO, ProductFilterDTO } from '../product';


@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class AdminTradeController extends BaseAdminTradeController<ProductDTO, ProductFilterDTO> { }
