import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateCertificationRequestDTO } from '@energyweb/issuer-api';

export class CreateIrecCertificationRequestDTO extends CreateCertificationRequestDTO {
    @ApiProperty({ type: String })
    @IsString()
    @IsOptional()
    irecTradeAccountCode?: string;
}
