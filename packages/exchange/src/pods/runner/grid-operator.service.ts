import { ConfigurationService } from '@energyweb/origin-backend';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class GridOperatorService implements OnModuleInit {
    private gridOperators: string[];

    constructor(private readonly moduleRef: ModuleRef) {}

    public async onModuleInit() {
        const configService = this.moduleRef.get(ConfigurationService, {
            strict: false
        });

        const { gridOperators } = await configService.get();

        this.gridOperators = gridOperators;
    }

    public areValid(gridOperators: string[]) {
        if (!gridOperators?.length) {
            return true;
        }

        return gridOperators.every((gridOperator) => this.gridOperators.includes(gridOperator));
    }
}
