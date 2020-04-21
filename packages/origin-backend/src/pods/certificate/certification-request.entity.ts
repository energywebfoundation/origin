import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';
import { CertificationRequestDTO } from './certification-request.dto';

@Entity()
export class CertificationRequest extends ExtendedBaseEntity implements CertificationRequestDTO {
    @PrimaryColumn()
    id: number;

    @Column('varchar')
    energy: string;

    @Column('simple-array')
    files: string[];
}
