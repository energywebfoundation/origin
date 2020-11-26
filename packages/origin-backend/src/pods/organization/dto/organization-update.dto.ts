import { OrganizationStatus, OrganizationUpdateData } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class OrganizationUpdateDTO implements OrganizationUpdateData {
    @ApiProperty({ enum: OrganizationStatus, enumName: 'OrganizationStatus' })
    @IsNotEmpty()
    @IsEnum(OrganizationStatus)
    status: OrganizationStatus;
}
