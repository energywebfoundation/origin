import { ApiProperty } from '@nestjs/swagger';
import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { IsBoolean, IsString, ValidateIf } from 'class-validator';

export class SuccessResponseDTO implements ISuccessResponse {
    @ApiProperty({ type: Boolean })
    @IsBoolean()
    success: boolean;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: SuccessResponseDTO) => !!dto.message)
    @IsString()
    message?: string;
}
