import { Registration } from './registration/registration.entity';
import { Connection } from './connection/connection.entity';

export * from './app.module';
export * from './registration';

export const entities = [Registration, Connection];
