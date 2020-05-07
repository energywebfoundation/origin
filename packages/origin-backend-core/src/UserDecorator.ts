import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserWithRelationsIds } from './User';
import { LoggedInUser } from './LoggedInUser';

export const UserDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IUserWithRelationsIds;

    return new LoggedInUser(user);
});
