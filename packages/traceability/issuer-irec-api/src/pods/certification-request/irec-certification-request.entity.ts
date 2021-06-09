import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IrecCertificationRequestDTO } from './full-certification-request.dto';

export const CERTIFICATION_REQUESTS_TABLE_NAME = 'irec_issuer_certification_request';

@Entity({ name: CERTIFICATION_REQUESTS_TABLE_NAME })
export class IrecCertificationRequest
    extends ExtendedBaseEntity
    implements IrecCertificationRequestDTO
{
    @PrimaryColumn()
    certificationRequestId: number;

    @Column()
    userId: string;

    @Column()
    irecIssueId: string;
}
