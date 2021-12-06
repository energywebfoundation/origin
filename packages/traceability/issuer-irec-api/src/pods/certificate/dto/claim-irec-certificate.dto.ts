import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClaimCertificateDTO } from '@energyweb/issuer-api';
import { Expose } from 'class-transformer';

export class ClaimIrecCertificateDTO extends ClaimCertificateDTO {
    @ApiProperty({ type: String })
    @IsOptional()
    @Expose()
    fromIrecAccountCode?: string;

    @ApiProperty({ type: String })
    @IsOptional()
    @Expose()
    toIrecAccountCode?: string;
}
