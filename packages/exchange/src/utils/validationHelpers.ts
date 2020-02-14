import { IUser } from '@energyweb/origin-backend-core';
import { ForbiddenException } from '@nestjs/common';

export const ensureUser = ({ userId }: { userId: string }, user: IUser) => {
    if (userId !== user.id.toString()) {
        throw new ForbiddenException();
    }
};
