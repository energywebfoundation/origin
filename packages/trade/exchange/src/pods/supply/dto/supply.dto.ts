import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SupplyDto {
    @ApiProperty({
        type: String,
        description: 'UUID string identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    ownerId: string;

    @ApiProperty({ type: String, example: 'Dev1-A' })
    @IsNotEmpty()
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsString()
    active: boolean;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsString()
    price: number;
}
