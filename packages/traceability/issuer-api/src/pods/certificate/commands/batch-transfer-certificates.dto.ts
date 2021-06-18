import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, Validate, IsEthereumAddress } from 'class-validator';

export class BatchTransferCertificatesDTO {
    @ApiProperty({ type: [Number] })
    @IsArray()
    certificateIds: number[];

    @ApiProperty({ type: String })
    @IsEthereumAddress()
    to: string;

    @ApiPropertyOptional({ type: [String] })
    @Validate(IntUnitsOfEnergy, { each: true })
    values?: string[];
}
