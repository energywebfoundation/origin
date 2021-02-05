import { DeviceSettingsUpdateData } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class DeviceSettingsUpdateDTO implements DeviceSettingsUpdateData {
    @ApiProperty({ type: Number, required: false })
    @IsNumber()
    @IsOptional()
    defaultAskPrice: number;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    automaticPostForSale: boolean;
}
