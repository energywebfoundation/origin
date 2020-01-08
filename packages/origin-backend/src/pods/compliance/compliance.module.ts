import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { Compliance } from './compliance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Compliance])],
    providers: [ComplianceService],
    controllers: [ComplianceController]
})
export class ComplianceModule {}
