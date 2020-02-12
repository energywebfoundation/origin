import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from 'typeorm';
import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { CertificationRequestStatus, ICertificationRequest } from '@energyweb/origin-backend-core';
import { Device } from '../device/device.entity';

@Entity()
export class CertificationRequest extends BaseEntity implements ICertificationRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    status: CertificationRequestStatus;

    @Column()
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    energy: number;

    @Column()
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    startTime: number;

    @Column()
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    endTime: number;

    @CreateDateColumn()
    createdDate: Date;

    @Column('simple-array')
    files: string[];

    @ManyToOne(() => Device, {
        nullable: false,
        eager: true
    })
    @JoinColumn()
    @IsNotEmpty()
    device: Device;
}
