import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { TUserBaseEntity, UserService } from '@energyweb/origin-backend';
import { IExternalUserService } from '@energyweb/exchange';

@Injectable()
export class ExternalUserService implements IExternalUserService {
    private _userService: UserService;

    constructor(private readonly moduleRef: ModuleRef) {}

    private get userService() {
        if (this._userService) {
            return this._userService;
        }

        this._userService = this.moduleRef.get<UserService>(UserService, {
            strict: false
        });

        return this._userService;
    }

    public async getPlatformAdmin(): Promise<TUserBaseEntity> {
        return await this.userService.getPlatformAdmin();
    }
}
