import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate, ValidateIf, ValidateNested } from 'class-validator';

import { ClaimDataDTO } from './claim-data.dto';

export class ClaimCertificateDTO {
    @ApiProperty({ type: ClaimDataDTO })
    @IsOptional()
    @ValidateNested()
    claimData?: ClaimDataDTO;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: ClaimCertificateDTO) => !!dto.amount)
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
