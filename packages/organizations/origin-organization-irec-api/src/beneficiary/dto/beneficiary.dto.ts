import { ApiProperty } from '@nestjs/swagger';
import { plainToClass, Type } from 'class-transformer';
import { PublicOrganizationInfoDTO } from '@energyweb/origin-backend';

export class BeneficiaryDTO {
    @ApiProperty({ type: Number })
    id: number;

    @ApiProperty({ type: Number })
    irecBeneficiaryId: number;
    @ApiProperty({ type: PublicOrganizationInfoDTO })
    @Type(() => PublicOrganizationInfoDTO)
    organization: PublicOrganizationInfoDTO;

    @ApiProperty({ type: Number })
    ownerOrganizationId: number;

    public static wrap(beneficiary: BeneficiaryDTO): BeneficiaryDTO {
        return plainToClass(BeneficiaryDTO, beneficiary);
    }
}
