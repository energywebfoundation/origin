import { SetMetadata } from '@nestjs/common';
import { Role } from '.';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
