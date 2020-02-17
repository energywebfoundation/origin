import { IUser } from '@energyweb/origin-backend-core';
import { createParamDecorator } from '@nestjs/common';

export const UserDecorator = createParamDecorator((data, req: any) => {
    return req.user as IUser;
});
