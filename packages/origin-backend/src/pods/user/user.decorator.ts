import { createParamDecorator } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { User } from './user.entity';

export const UserDecorator = createParamDecorator((data, req: ExpressRequest) => {
    return req.user as User;
});
