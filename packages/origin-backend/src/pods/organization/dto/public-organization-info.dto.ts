import { IPublicOrganization, OrganizationStatus } from '@energyweb/origin-backend-core';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass } from 'class-transformer';
import { IsEnum, IsInt, IsISO31661Alpha2, IsString, Min } from 'class-validator';
import { Organization } from '../organization.entity';

export class PublicOrganizationInfoDTO implements IPublicOrganization {
    @ApiProperty({ type: Number })
    @Expose()
    @IsInt()
    @Min(0)
    id: number;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    name: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    address: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    zipCode: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    city: string;

    @ApiProperty({ type: String })
    @IsISO31661Alpha2()
    @Expose()
    country: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    businessType: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    tradeRegistryCompanyNumber: string;

    @ApiProperty({ type: String })
    @IsString()
    @Expose()
    vatNumber: string;

    @ApiProperty({ enum: OrganizationStatus, enumName: 'OrganizationStatus' })
    @IsEnum(OrganizationStatus)
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
