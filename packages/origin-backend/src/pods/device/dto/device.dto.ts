import { IDevice, IPublicOrganization } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { PublicOrganizationInfoDTO } from '../../organization';
import { CreateDeviceDTO } from './create-device.dto';
import { SmartMeterStatsDTO } from './smart-meter-stats.dto';

export class DeviceDTO extends CreateDeviceDTO implements IDevice {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ type: SmartMeterStatsDTO, required: false })
    @IsOptional()
    meterStats?: SmartMeterStatsDTO;

    @ApiProperty({ type: PublicOrganizationInfoDTO })
    @ValidateNested()
    organization: IPublicOrganization;
}
