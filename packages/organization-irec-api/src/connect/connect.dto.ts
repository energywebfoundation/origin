import { Expose, plainToClass } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConnectDTO {
    @Expose()
    @IsString()
    @IsNotEmpty()
    code: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    leadUserFullName: string;

    @Expose()
    @IsEmail()
    leadUserEmail: string;

    public static sanitize(connect: ConnectDTO): ConnectDTO {
        return plainToClass(ConnectDTO, connect, { excludeExtraneousValues: true });
    }
}
