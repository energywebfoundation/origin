import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { IsInt, Min, IsBoolean, IsDate, IsPositive } from 'class-validator';
import { CertificationRequestStatus } from '@energyweb/issuer-api';
import { CertificationRequestDTO } from './certification-request.dto';

export const CERTIFICATION_REQUESTS_TABLE_NAME = 'issuer_certification_request';

@Entity({ name: CERTIFICATION_REQUESTS_TABLE_NAME })
@Unique(['requestId'])
export class CertificationRequest extends ExtendedBaseEntity implements CertificationRequestDTO {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    requestId: number;

    @Column('varchar')
    owner: string;

    @Column('varchar', { nullable: false })
    energy: string;

    @Column()
    deviceId: string;

    @Column()
    @IsInt()
    @IsPositive()
    fromTime: number;

    @Column()
    @IsInt()
    @IsPositive()
    toTime: number;

    @Column('simple-array', { nullable: false, default: [] })
    files: string[];

    @Column({ nullable: true })
    @IsInt()
    @IsPositive()
    created: number;

    @Column()
    @IsBoolean()
    approved: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    @IsDate()
    approvedDate: Date;

    @Column()
    @IsBoolean()
    revoked: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    @IsDate()
    revokedDate: Date;

    @Column({ nullable: true })
    @IsInt()
    @Min(0)
    issuedCertificateTokenId: number;

    @Column()
    @IsBoolean()
    isPrivate: boolean;

    @Column('varchar')
    status: CertificationRequestStatus;

    @Column()
    irecIssueId: string;
}
