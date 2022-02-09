import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';

import { ClaimDataDTO, IsClaimData } from './claim-data.dto';

export class ClaimCertificateDTO {
    @IsOptional()
    @ApiPropertyOptional({
        type: 'object',
        additionalProperties: true,
        description:
            'Object containing nulls, string, numbers, and arrays or objects of these (recursive type)',
        example:
            '{ "location": "Some location", "beneficiaries": [1, 2], "metadata": { "claimerType": "Electric vehicle" } }'
    })
    @IsClaimData()
    claimData?: ClaimDataDTO;

    @ApiPropertyOptional({ type: String, example: '1000000' })
    @IsOptional()
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    amount?: string;
}
