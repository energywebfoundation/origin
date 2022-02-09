import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Validate, IsOptional, IsEthereumAddress } from 'class-validator';

import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { CertificateBatchOperations } from '@energyweb/issuer';

import { CertificateDTO } from './certificate.dto';

export class BatchCertificateTransferDTO
    extends PickType(CertificateDTO, ['id'] as const)
    implements
        Omit<CertificateBatchOperations.BatchCertificateTransfer, 'amount' | 'schemaVersion'>
{
    @ApiProperty({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsEthereumAddress()
    to: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Public blockchain address',
        example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
    })
    @IsOptional()
    @IsEthereumAddress()
    from?: string;

    @ApiPropertyOptional({ type: String, example: '1000' })
    @IsOptional()
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
