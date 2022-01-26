import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignerAdapter, InternalSignerAdapter } from './tokens';
import { EncryptedSignerAdapter } from './encrypted-signer.adapter';
import { SignerEntity } from './signer.entity';

const adapterProvider = {
    provide: InternalSignerAdapter,
    useFactory: async (signerRepository: Repository<SignerEntity>, moduleRef: ModuleRef) => {
        try {
            return moduleRef.get(SignerAdapter as any, { strict: false });
        } catch {
            return new EncryptedSignerAdapter(signerRepository);
        }
    },
    inject: [getRepositoryToken(SignerEntity), ModuleRef]
};

@Module({
    imports: [TypeOrmModule.forFeature([SignerEntity])],
    providers: [adapterProvider],
    exports: [adapterProvider]
})
export class SignerModule {}
