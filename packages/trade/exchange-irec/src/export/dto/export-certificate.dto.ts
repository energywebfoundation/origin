import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExportCertificateDTO {
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    readonly certificateId: string;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    readonly recipientTradeAccount: string;
}
