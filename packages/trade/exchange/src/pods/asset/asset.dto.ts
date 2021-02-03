import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IAsset } from './asset.entity';
import { CreateAssetDTO } from './create-asset.dto';

export class AssetDTO extends CreateAssetDTO implements IAsset {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    id: string;
}
