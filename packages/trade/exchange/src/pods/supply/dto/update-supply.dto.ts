import { Expose, plainToClass } from 'class-transformer';
import { IsBoolean, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplyDto {
    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @Expose()
    active: boolean;

    @ApiProperty({ type: Number })
    @IsPositive()
    @IsInt()
    @Expose()
    price: number;

    public static sanitize(supply: UpdateSupplyDto): UpdateSupplyDto {
        return plainToClass(UpdateSupplyDto, supply, { excludeExtraneousValues: true });
    }
}
