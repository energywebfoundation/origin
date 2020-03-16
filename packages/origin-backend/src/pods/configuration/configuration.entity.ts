import { Entity, PrimaryColumn, BaseEntity, Column, Check } from 'typeorm';
import { ExternalDeviceIdType, IOriginConfiguration, IRegions, IDeviceType } from '@energyweb/origin-backend-core';

@Entity()
@Check(`id = 1`)
export class Configuration extends BaseEntity implements IOriginConfiguration {
    @PrimaryColumn({type: 'int', default: () => `1`, nullable: false})
    id: 1;

    @Column('varchar', { nullable: true })
    countryName: string;

    @Column('simple-array', { nullable: true })
    currencies: string[];

    @Column('simple-json', { nullable: true })
    regions?: IRegions;

    @Column('simple-json', { nullable: true })
    externalDeviceIdTypes: ExternalDeviceIdType[];

    @Column('varchar', { length: 42, nullable: true })
    marketContractLookup: string;

    @Column('varchar', { nullable: true })
    complianceStandard: string;

    @Column('simple-json', { nullable: true })
    deviceTypes?: IDeviceType[];
}
