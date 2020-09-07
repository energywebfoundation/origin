import { Expose, plainToClass } from 'class-transformer';
import { Organization } from './organization.entity';
import { PublicOrganizationInfoDTO } from './public-organization-info.dto';

export class FullOrganizationInfoDTO extends PublicOrganizationInfoDTO {
    @Expose()
    signatoryFullName: string;

    @Expose()
    signatoryAddress: string;

    @Expose()
    signatoryZipCode: string;

    @Expose()
    signatoryCity: string;

    @Expose()
    signatoryCountry: number;

    @Expose()
    signatoryEmail: string;

    @Expose()
    signatoryPhoneNumber: string;

    public static fromPlatformOrganization(
        platformOrganization: Organization
    ): FullOrganizationInfoDTO {
        return plainToClass(FullOrganizationInfoDTO, platformOrganization, {
            excludeExtraneousValues: true
        });
    }
}
