/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (data.success !== undefined && !data.success && data.statusCode) {
                    throw new HttpException(
                        data.message ?? 'Something went wrong',
                        data.statusCode
                    );
                }
                return data;
            })
        );
    }
}
