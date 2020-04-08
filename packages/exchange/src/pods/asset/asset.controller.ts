import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AssetService } from './asset.service';

@Controller('asset')
@UseInterceptors(ClassSerializerInterceptor)
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @Get('/:id')
    @UseGuards(AuthGuard())
    public get(@Param('id', new ParseUUIDPipe({ version: '4' })) assetId: string) {
        return this.assetService.get(assetId);
    }
}
