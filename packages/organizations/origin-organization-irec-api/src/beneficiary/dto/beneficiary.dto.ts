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
    organization?: PublicOrganizationInfoDTO;

    @ApiProperty({ type: Number })
    ownerId?: number;

    @ApiProperty({ type: String })
    name: string;

    @ApiProperty({ type: String })
    countryCode: string;

    @ApiProperty({ type: String })
    location: string;

    @ApiProperty({ type: Boolean })
    active: boolean;

    public static wrap(beneficiary: BeneficiaryDTO): BeneficiaryDTO {
        return plainToClass(BeneficiaryDTO, beneficiary);
    }
}
