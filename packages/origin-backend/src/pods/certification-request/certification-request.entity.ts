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

    @Column()
    userId: string;

    @Column('varchar', { nullable: false })
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

    @Column('simple-array', { nullable: false, default: [] })
    files: string[];

    @Column()
    @Min(0)
    created: number;

    @Column()
    @IsBoolean()
    approved: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    approvedDate: Date;

    @Column()
    @IsBoolean()
    revoked: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    revokedDate: Date;
}
