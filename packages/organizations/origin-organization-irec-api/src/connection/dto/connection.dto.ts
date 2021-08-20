import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Connection } from '../connection.entity';
import { RegistrationDTO } from '../../registration';

export class ShortConnectionDTO {
    @ApiProperty({ type: Date })
    expiryDate: Date;

    @ApiProperty({ type: RegistrationDTO })
    @ValidateNested()
    registration: RegistrationDTO;

    public static sanitize(connection: ShortConnectionDTO): ShortConnectionDTO {
        return plainToClass(ShortConnectionDTO, connection, { excludeExtraneousValues: true });
    }
}

export class ConnectionDTO extends ShortConnectionDTO {
    @ApiProperty({ type: String })
    accessToken: string;

    @ApiProperty({ type: String })
    refreshToken: string;

    @ApiProperty({ type: String })
    userName: string;

    public static wrap(connection: Connection): ConnectionDTO {
        return plainToClass(ConnectionDTO, connection);
    }
}
