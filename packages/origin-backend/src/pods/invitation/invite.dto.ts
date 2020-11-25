import { OrganizationRole, Role } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class InviteDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ enum: Role, enumName: 'Role' })
    @IsEnum(Role)
    role: OrganizationRole;
}
