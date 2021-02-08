import { Expose, plainToClass } from 'class-transformer';
import { IsBoolean, IsInt, IsPositive } from 'class-validator';

export class UpdateSupplyDto {
    @IsBoolean()
    @Expose()
    active: boolean;

    @IsPositive()
    @IsInt()
    @Expose()
    price: number;

    public static sanitize(supply: UpdateSupplyDto): UpdateSupplyDto {
        return plainToClass(UpdateSupplyDto, supply, { excludeExtraneousValues: true });
    }
}
