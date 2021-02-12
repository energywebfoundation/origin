import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { IAsset } from './asset.entity';

export class CreateAssetDTO implements Omit<IAsset, 'id'> {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    tokenId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Date })
    @IsDate()
    generationFrom: Date;

    @ApiProperty({ type: Date })
    @IsDate()
    generationTo: Date;
}
