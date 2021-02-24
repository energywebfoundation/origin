import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SupplyDto {
    @ApiProperty({ type: String })
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    ownerId: string;

    @ApiProperty({ type: String })
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
