import { ApiProperty } from '@nestjs/swagger';

export class IRevokeCertificationRequestDTO {
    @ApiProperty()
    id: number;
}
