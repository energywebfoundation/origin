import { Expose, plainToClass } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateSupplyDto {
    @IsNotEmpty()
    @IsString()
    @Expose()
    deviceId: string;

    @IsBoolean()
    @Expose()
    active: boolean;

    @IsPositive()
    @IsInt()
    @Expose()
    price: number;

    public static sanitize(supply: CreateSupplyDto): CreateSupplyDto {
        return plainToClass(CreateSupplyDto, supply, { excludeExtraneousValues: true });
    }
}
