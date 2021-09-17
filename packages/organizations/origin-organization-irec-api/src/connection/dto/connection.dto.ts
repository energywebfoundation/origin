import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass } from 'class-transformer';
import { Connection } from '../connection.entity';

export class ShortConnectionDTO {
    @Expose()
    @ApiProperty({ type: Date })
    expiryDate: Date;

    @Expose()
    @ApiProperty({ type: String })
    userName: string;

    @Expose()
    @ApiProperty({ type: String })
    clientId: string;

    @Expose()
    @ApiProperty({ type: Boolean })
    active: boolean;

    public static sanitize(connection: ShortConnectionDTO): ShortConnectionDTO {
        return plainToClass(ShortConnectionDTO, connection, { excludeExtraneousValues: true });
    }
}

export class ConnectionDTO extends ShortConnectionDTO {
    @ApiProperty({ type: String })
    @Expose()
    accessToken: string;

    @ApiProperty({ type: String })
    @Expose()
    refreshToken: string;

    @ApiProperty({ type: String })
    @Expose()
    clientSecret: string;

    public static wrap(connection: Connection): ConnectionDTO {
        return plainToClass(ConnectionDTO, connection, { excludeExtraneousValues: true });
    }
}
