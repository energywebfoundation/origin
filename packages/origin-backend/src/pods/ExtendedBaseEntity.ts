import { Entity, BaseEntity, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class ExtendedBaseEntity extends BaseEntity {
    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
