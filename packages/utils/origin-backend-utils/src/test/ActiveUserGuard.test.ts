// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '@energyweb/origin-backend-core';
import { ExecutionContext } from '@nestjs/common';
import { ActiveUserGuard } from '../..';

describe('DeviceTypeService tests', () => {
    let guard: ActiveUserGuard;
    const reflector: Reflector = {} as Reflector;

    before(() => {
        guard = new ActiveUserGuard(reflector);
    });

    it('Active user should pass guard', () => {
        const context: ExecutionContext = ({
            switchToHttp: () => {
                return {
                    getRequest: () => {
                        return {
                            user: {
                                status: UserStatus.Active
                            }
                        };
                    }
                };
            }
        } as unknown) as ExecutionContext;
        // eslint-disable-next-line no-unused-expressions
        expect(guard.canActivate(context)).true;
    });

    it('Inactive user should not pass guard', () => {
        const context: ExecutionContext = ({
            switchToHttp: () => {
                return {
                    getRequest: () => {
                        return {
                            user: {
                                status: UserStatus.Suspended
                            }
                        };
                    }
                };
            }
        } as unknown) as ExecutionContext;
        // eslint-disable-next-line no-unused-expressions
        expect(guard.canActivate.bind(context)).to.throw;
    });
});
