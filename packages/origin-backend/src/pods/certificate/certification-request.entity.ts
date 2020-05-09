import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { IsNotEmpty, Min, IsBoolean } from 'class-validator';
import { ICertificationRequestBackend } from '@energyweb/origin-backend-core';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { Device } from '../device/device.entity';

@Entity()
export class CertificationRequest extends ExtendedBaseEntity
    implements ICertificationRequestBackend {
    @PrimaryColumn()
    id: number;

    @Column('varchar')
    owner: string;

    @Column('varchar', { nullable: true })
    energy: string;

    @ManyToOne(() => Device, (device) => device.certificationRequests, { nullable: false })
    @IsNotEmpty()
    device: Device;

    @Column()
    @Min(0)
    fromTime: number;

    @Column()
    @Min(0)
    toTime: number;

    @Column('simple-array', { nullable: true })
    files: string[];

    @Column()
    @Min(0)
    created: number;

    @Column()
    @IsBoolean()
    approved: boolean;

    @Column()
    @IsBoolean()
    revoked: boolean;
}
