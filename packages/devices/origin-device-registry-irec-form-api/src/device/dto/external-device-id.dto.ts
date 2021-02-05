import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExternalDeviceIdDTO implements IExternalDeviceId {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    type: string;
}
