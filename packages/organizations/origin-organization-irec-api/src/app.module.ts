import { Module } from '@nestjs/common';

import { RegistrationModule } from './registration';
import { ConnectionModule } from './connection';

@Module({
    imports: [RegistrationModule, ConnectionModule]
})
export class AppModule {}
