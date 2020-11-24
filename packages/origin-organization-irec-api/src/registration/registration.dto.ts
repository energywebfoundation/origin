import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewRegistrationDTO } from './new-registration.dto';

export class RegistrationDTO extends NewRegistrationDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    owner: string;
}
