import { IOrganizationUpdateMemberRole } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMemberDTO implements IOrganizationUpdateMemberRole {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    role: number;
}
