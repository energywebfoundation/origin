import { NullOrUndefinedResultInterceptor } from '@energyweb/origin-backend-utils';
import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';

import { AssetService } from './asset.service';

@Controller('asset')
@UseInterceptors(ClassSerializerInterceptor, NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @Get('/:id')
    public get(@Param('id', new ParseUUIDPipe({ version: '4' })) assetId: string) {
        return this.assetService.get(assetId);
    }
}
