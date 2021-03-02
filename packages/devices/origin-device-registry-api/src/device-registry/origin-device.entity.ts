import { IExternalDeviceId } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'device_registry_device' })
export class OriginDevice extends ExtendedBaseEntity {
    constructor(device: Partial<OriginDevice>) {
        super();
        Object.assign(this, device);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    owner: string;

    @Column({ unique: true })
    externalRegistryId: string;

    @Column({ unique: true })
    smartMeterId: string;

    @Column('simple-json', { nullable: true })
    externalDeviceIds?: IExternalDeviceId[];

    @Column()
    description: string;

    @Column('simple-array', { nullable: true })
    imageIds: string[];
}
