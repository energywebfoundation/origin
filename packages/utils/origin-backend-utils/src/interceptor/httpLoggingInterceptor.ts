import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HTTPLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(HTTPLoggingInterceptor.name);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();

        const { method } = request;
        const url = request.originalUrl;

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const delay = Date.now() - now;
                this.logger.log(`${response.statusCode} | [${method}] ${url} - ${delay}ms`);
            }),
            catchError((error) => {
                const response = context.switchToHttp().getResponse();
                const delay = Date.now() - now;
                this.logger.error(
                    `${response.statusCode} | [${method}] ${url} - ${JSON.stringify(
                        error.message
                    )} - ${delay}ms`
                );
                return throwError(error);
            })
        );
    }
}
