import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountBalanceModule } from '@energyweb/exchange';
import { IrecModule } from '@energyweb/origin-organization-irec-api';

import { ExportController } from './export.controller';
import { CertificationRequestModule } from '@energyweb/issuer-irec-api';

@Module({
    providers: [],
    imports: [AccountBalanceModule, IrecModule, CqrsModule, CertificationRequestModule],
    controllers: [ExportController]
})
export class ExportModule {}
