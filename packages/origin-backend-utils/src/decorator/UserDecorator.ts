import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserWithRelationsIds, LoggedInUser } from '@energyweb/origin-backend-core';

export const UserDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IUserWithRelationsIds;

    return new LoggedInUser(user);
});
