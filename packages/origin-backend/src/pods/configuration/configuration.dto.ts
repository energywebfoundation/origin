import { IDeviceType, IOriginConfiguration, IRegions } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { ExternalDeviceIdTypeDTO } from './dto/external-device-id-type.dto';

export class ConfigurationDTO implements IOriginConfiguration {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    countryName?: string;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    currencies?: string[];

    @ApiProperty({ type: Object, required: false })
    @IsOptional()
    @IsObject()
    regions?: IRegions;

    @ApiProperty({ type: [ExternalDeviceIdTypeDTO], required: false })
    @IsOptional()
    @IsArray()
    externalDeviceIdTypes?: ExternalDeviceIdTypeDTO[];

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    complianceStandard?: string;

    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
        required: false
    })
    @IsOptional()
    @IsArray()
    deviceTypes?: IDeviceType[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    gridOperators?: string[];
}
