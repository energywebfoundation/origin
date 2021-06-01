import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConnectionDTO {
    @ApiProperty({ type: String })
    @IsString()
    userName: string;

    @ApiProperty({ type: String })
    @IsString()
    password: string;

    @ApiProperty({ type: String })
    @IsString()
    clientId: string;

    @ApiProperty({ type: String })
    @IsString()
    clientSecret: string;
}
