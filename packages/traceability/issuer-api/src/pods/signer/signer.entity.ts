import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsInt } from 'class-validator';

export const SIGNER_TABLE_NAME = 'issuer_signer';

@Entity({ name: SIGNER_TABLE_NAME })
export class SignerEntity {
    @PrimaryColumn()
    @IsInt()
    blockchainNetId: number;

    @Column()
    platformOperatorPrivateKey: string;

    // Column used for automated migration - after migration key won't be encrypted
    // but it will be encrypted during first accessing
    @Column({ type: 'boolean' })
    isEncrypted: boolean;
}
