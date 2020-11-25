import {
    IOrganizationUpdateMemberRole,
    OrganizationRole,
    Role
} from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateMemberDTO implements IOrganizationUpdateMemberRole {
    @ApiProperty({ enum: Role, enumName: 'Role' })
    @IsEnum(Role)
    role: OrganizationRole;
}
