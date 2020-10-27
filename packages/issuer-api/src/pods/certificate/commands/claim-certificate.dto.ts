import { IClaimData } from '@energyweb/issuer';
import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, Validate, ValidateIf } from 'class-validator';

export class ClaimCertificateDTO {
    @ApiProperty({ type: Object })
    @IsObject()
    claimData: IClaimData;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: ClaimCertificateDTO) => !!dto.amount)
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
