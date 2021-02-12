/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    NotFoundException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NullOrUndefinedResultInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (data === null || data === undefined) {
                    throw new NotFoundException();
                }
                return data;
            })
        );
    }
}
