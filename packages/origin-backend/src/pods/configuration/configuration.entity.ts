import { Entity, PrimaryColumn, Column, Check } from 'typeorm';
import {
    ExternalDeviceIdType,
    IOriginConfiguration,
    IRegions,
    IDeviceType
} from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { IsArray, IsString } from 'class-validator';

@Entity()
@Check(`id = 1`)
export class Configuration extends ExtendedBaseEntity implements IOriginConfiguration {
    @PrimaryColumn({ type: 'int', default: 1, nullable: false })
    id: number;

    @Column('varchar', { nullable: true })
    @IsString()
    countryName: string;

    @Column('simple-array', { nullable: true })
    @IsArray()
    currencies: string[];

    @Column('simple-json', { nullable: true })
    externalDeviceIdTypes?: ExternalDeviceIdType[];

    @Column('simple-json', { nullable: true })
    regions?: IRegions;

    @Column('varchar', { nullable: true })
    @IsString()
    complianceStandard: string;

    @Column('simple-json', { nullable: true })
    @IsArray()
    deviceTypes?: IDeviceType[];

    @Column('simple-array', { nullable: true })
    @IsArray()
    gridOperators?: string[];
}
