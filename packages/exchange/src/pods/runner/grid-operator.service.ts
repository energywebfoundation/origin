import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IExchangeConfigurationService } from '../../interfaces';

@Injectable()
export class GridOperatorService implements OnModuleInit {
    private gridOperators: string[];

    constructor(private readonly moduleRef: ModuleRef) {}

    public async onModuleInit() {
        const configService = this.moduleRef.get<IExchangeConfigurationService>(
            IExchangeConfigurationService,
            {
                strict: false
            }
        );

        this.gridOperators = await configService.getGridOperators();
    }

    public areValid(gridOperators: string[]) {
        if (!gridOperators?.length) {
            return true;
        }

        return gridOperators.every((gridOperator) => this.gridOperators.includes(gridOperator));
    }
}
