import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NewDidOrganizationDto {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    public ensNamespace: string;
}
