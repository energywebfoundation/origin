import {
    HTTPLoggingInterceptor,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { ConnectModule } from './connect/connect.module';
import { RegistrationModule } from './registration/registration.module';

export const providers = [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: NullOrUndefinedResultInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HTTPLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }
];

@Module({
    imports: [ConnectModule, RegistrationModule],
    providers
})
export class AppModule {}
