import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Validate, ValidateNested } from 'class-validator';

import { ClaimDataDTO } from './claim-data.dto';

export class ClaimCertificateDTO {
    @ApiPropertyOptional({ type: ClaimDataDTO })
    @IsOptional()
    @ValidateNested()
    claimData?: ClaimDataDTO;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
