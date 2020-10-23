import { ApiProperty } from '@nestjs/swagger';
import { ISuccessResponse } from '@energyweb/origin-backend-core';

export class ISuccessResponseDTO implements ISuccessResponse {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    message?: string;
}
