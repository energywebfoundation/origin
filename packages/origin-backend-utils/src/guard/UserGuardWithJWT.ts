import { Injectable, HttpException, Inject } from '@nestjs/common';
import { UserGuardWithJWT('jwt') } from '@nestjs/passport';
import { IUserWithRelationsIds, Status, Role } from '@energyweb/origin-backend-core';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserGuardWithJWT extends UserGuardWithJWT('jwt') {
    @Inject('Reflector')
    private reflector: Reflector;
    
    constructor(type:string = 'jwt'){
        super(type);
    }

    handleRequest(err: any, user: any, info: any, context: any) {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        console.log(roles);
        if (!roles) {
            return user;
        }
        
        const _user = user as IUserWithRelationsIds;
        if(_user.status == Status.Pending){
            throw new HttpException(`Only active users can perform this action. Your status is ${Status[_user.status]}`, 412);;
        }
        // don't throw 401 error when unauthenticated
        return user;
      }
}


