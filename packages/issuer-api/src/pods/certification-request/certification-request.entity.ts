import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsInt, Min, IsBoolean } from 'class-validator';
import { ICertificationRequestDTO } from './certification-request.dto';

export const CERTIFICATION_REQUESTS_TABLE_NAME = 'issuer_certification_request';

@Entity({ name: CERTIFICATION_REQUESTS_TABLE_NAME })
@Unique(['requestId'])
export class CertificationRequest extends ExtendedBaseEntity implements ICertificationRequestDTO {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    requestId: number;

    @Column('varchar')
    owner: string;

    @Column('varchar', { nullable: false })
    energy: string;

    @Column()
    deviceId: string;

    @Column()
    @IsInt()
    @Min(0)
    fromTime: number;

    @Column()
    @IsInt()
    @Min(0)
    toTime: number;

    @Column('simple-array', { nullable: false, default: [] })
    files: string[];

    @Column()
    @IsInt()
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

    @Column({ nullable: true })
    @IsInt()
    @Min(0)
    issuedCertificateTokenId: number;

    @Column()
    @IsBoolean()
    isPrivate: boolean;
}
