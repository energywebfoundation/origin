import { NullOrUndefinedResultInterceptor } from '@energyweb/origin-backend-utils';
import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetDTO } from './asset.dto';

import { AssetService } from './asset.service';

@ApiTags('asset')
@Controller('asset')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @Get('/:id')
    @ApiResponse({ status: HttpStatus.OK, type: AssetDTO, description: 'Gets the Asset' })
    public get(
        @Param('id', new ParseUUIDPipe({ version: '4' })) assetId: string
    ): Promise<AssetDTO> {
        return this.assetService.get(assetId);
    }
}
