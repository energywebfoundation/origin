import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class BlockchainPropertiesDTO {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsInt()
    netId: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    registry: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    issuer: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    rpcNode: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    rpcNodeFallback: string;
}
