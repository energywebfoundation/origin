import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ImportIrecCertificateDTO {
    @ApiProperty({ type: String })
    @Expose()
    assetId: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @Expose()
    fromIrecAccountCode?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @Expose()
    toIrecAccountCode?: string;
}
