import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IrecCertificationRequestDTO } from './full-certification-request.dto';
import { IsOptional } from 'class-validator';

export const IREC_CERTIFICATION_REQUESTS_TABLE_NAME = 'irec_issuer_certification_request';

@Entity({ name: IREC_CERTIFICATION_REQUESTS_TABLE_NAME })
export class IrecCertificationRequest
    extends ExtendedBaseEntity
    implements IrecCertificationRequestDTO
{
    @PrimaryColumn()
    certificationRequestId: number;

    @Column()
    userId: string;

    @Column({ default: '' })
    @IsOptional()
    irecIssueRequestId?: string;

    @Column({ default: '' })
    @IsOptional()
    irecCertificateId?: string; // It is called an "Item" in IREC API
}
