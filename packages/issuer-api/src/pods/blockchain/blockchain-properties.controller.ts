import { ActiveUserGuard } from '@energyweb/origin-backend-utils';
import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockchainPropertiesDTO } from './blockchain-properties.dto';
import { BlockchainPropertiesService } from './blockchain-properties.service';

@ApiTags('blockchain-properties')
@Controller('blockchain-properties')
export class BlockchainPropertiesController {
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: BlockchainPropertiesDTO,
        description: 'Returns blockchain properties'
    })
    public async get(): Promise<BlockchainPropertiesDTO> {
        return this.blockchainPropertiesService.dto();
    }
}
