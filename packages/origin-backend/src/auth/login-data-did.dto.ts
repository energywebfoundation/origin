import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDataDidDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    identityToken: string;
}
