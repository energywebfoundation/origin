import { Entity, PrimaryColumn, BaseEntity, Column, Check } from 'typeorm';
import { ExternalDeviceIdType, IOriginConfiguration } from '@energyweb/origin-backend-core';

@Entity()
@Check(`id = 1`)
export class Configuration extends BaseEntity implements IOriginConfiguration {
    @PrimaryColumn({type: 'int', default: () => `1`, nullable: false})
    id: 1;

    @Column('varchar', { nullable: true })
    countryName: string;

    @Column('simple-array', { nullable: true })
    currencies: string[];

    @Column('varchar', { nullable: true })
    regions: string;

    @Column('simple-json', { nullable: true })
    externalDeviceIdTypes: ExternalDeviceIdType[];

    @Column('varchar', { length: 42, nullable: true })
    marketContractLookup: string;

    @Column('varchar', { nullable: true })
    complianceStandard: string;

    @Column({ nullable: true })
    deviceTypes: string;
}
