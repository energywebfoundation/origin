import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ImportIrecCertificateDTO {
    @ApiProperty({ type: String })
    @Expose()
    assetId: string;
}
