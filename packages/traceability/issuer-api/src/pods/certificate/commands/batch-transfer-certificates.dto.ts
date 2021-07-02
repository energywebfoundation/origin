import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsEthereumAddress } from 'class-validator';
import { CertificateAmountDTO } from '../dto/certificate-amount.dto';

export class BatchTransferCertificatesDTO {
    @ApiProperty({ type: [CertificateAmountDTO] })
    @ValidateNested({ each: true })
    certificateAmounts: CertificateAmountDTO[];

    @ApiProperty({ type: String })
    @IsEthereumAddress()
    to: string;
}
