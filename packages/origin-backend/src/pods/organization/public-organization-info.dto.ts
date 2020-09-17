import { OrganizationStatus } from '@energyweb/origin-backend-core';
import { Expose, plainToClass } from 'class-transformer';
import { Organization } from './organization.entity';

export class PublicOrganizationInfoDTO {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    address: string;

    @Expose()
    zipCode: string;

    @Expose()
    city: string;

    @Expose()
    country: number;

    @Expose()
    businessType: string;

    @Expose()
    tradeRegistryCompanyNumber: string;

    @Expose()
    vatNumber: string;

    @Expose()
    status: OrganizationStatus;

    public static fromPlatformOrganization(
        platformOrganization: Organization
    ): PublicOrganizationInfoDTO {
        return plainToClass(PublicOrganizationInfoDTO, platformOrganization, {
            excludeExtraneousValues: true
        });
    }
}
