import { Expose, plainToClass } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplyDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    @Expose()
    deviceId: string;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @Expose()
    active: boolean;

    @ApiProperty({ type: Number })
    @IsPositive()
    @IsInt()
    @Expose()
    price: number;

    public static sanitize(supply: CreateSupplyDto): CreateSupplyDto {
        return plainToClass(CreateSupplyDto, supply, { excludeExtraneousValues: true });
    }
}
