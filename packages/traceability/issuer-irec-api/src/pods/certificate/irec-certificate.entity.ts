import { ExtendedBaseEntity } from '@energyweb/origin-backend-utils';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { IsInt } from 'class-validator';
import { Certificate } from '@energyweb/issuer-api';

export const IREC_CERTIFICATES_TABLE_NAME = 'irec_issuer_certificate';

@Entity({ name: IREC_CERTIFICATES_TABLE_NAME })
export class IrecCertificate extends ExtendedBaseEntity {
    @PrimaryColumn()
    @OneToOne(() => Certificate)
    @IsInt()
    certificateId: number;

    @Column()
    irecCertificateId: string;
}
