import { SetMetadata } from '@nestjs/common';
import { Role } from '@energyweb/origin-backend-core';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
