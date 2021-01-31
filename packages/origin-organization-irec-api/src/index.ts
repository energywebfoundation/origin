import { Connection } from './connection/connection.entity';
import { Registration } from './registration/registration.entity';

export * from './app.module';
export * from './registration';
export * from './connection';

export const entities = [Registration, Connection];
