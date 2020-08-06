import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { Min } from 'class-validator';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { CertificationRequestQueueItemDTO } from './certification-request-queue-item.dto';

@Entity()
@Unique(['deviceId', 'fromTime', 'toTime'])
export class CertificationRequestQueueItem extends ExtendedBaseEntity
    implements CertificationRequestQueueItemDTO {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { nullable: false })
    energy: string;

    @Column()
    deviceId: string;

    @Column()
    @Min(0)
    fromTime: number;

    @Column()
    @Min(0)
    toTime: number;

    @Column('simple-array', { nullable: false, default: [] })
    files: string[];
}
