import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { Connection } from '../connection.entity';

export class ConnectionDTO {
    @ApiProperty({ type: String })
    accessToken: string;

    @ApiProperty({ type: String })
    refreshToken: string;

    @ApiProperty({ type: Date })
    expiryDate: Date;

    public static wrap(connection: Connection): ConnectionDTO {
        return plainToClass(ConnectionDTO, connection);
    }
}
