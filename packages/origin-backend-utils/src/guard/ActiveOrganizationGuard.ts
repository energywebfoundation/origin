import { IUser, OrganizationStatus } from '@energyweb/origin-backend-core';
import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable
} from '@nestjs/common';

@Injectable()
export class ActiveOrganizationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user as IUser;

        if (!user.organization) {
            throw new HttpException(`Organization was not registered`, HttpStatus.FORBIDDEN);
        }

        if (user.organization.status !== OrganizationStatus.Active) {
            throw new HttpException(
                `Only active organizations can perform this action. Your status is ${user.organization.status}`,
                HttpStatus.FORBIDDEN
            );
        }

        return true;
    }
}
