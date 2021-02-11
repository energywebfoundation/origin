import { IntUnitsOfEnergy, PositiveBNStringValidator } from '@energyweb/origin-backend-utils';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsInt,
    IsPositive,
    IsString,
    Min,
    Validate,
    ValidateIf
} from 'class-validator';
import { CertificationRequestStatus } from './certification-request-status.enum';

export class CertificationRequestDTO {
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(0)
    id: number;

    @ApiProperty({ type: String })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: String })
    @Validate(PositiveBNStringValidator)
    @Validate(IntUnitsOfEnergy)
    energy: string;

    @ApiProperty({ type: String })
    @IsString()
    owner: string;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    fromTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    toTime: number;

    @ApiProperty({ type: [String] })
    @IsArray()
    files: string[];

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    created: number;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    approved: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    revoked: boolean;

    @ApiProperty({ type: Number })
    @ValidateIf((dto: CertificationRequestDTO) => !!dto.requestId)
    @IsInt()
    @Min(0)
    requestId?: number;

    @ApiProperty({ type: Date, required: false })
    @ValidateIf((dto: CertificationRequestDTO) => !!dto.approvedDate)
    @IsDate()
    approvedDate?: Date;

    @ApiProperty({ type: Date, required: false })
    @ValidateIf((dto: CertificationRequestDTO) => !!dto.revokedDate)
    @IsDate()
    revokedDate?: Date;

    @ApiProperty({ type: Number, required: false })
    @ValidateIf((dto: CertificationRequestDTO) => !!dto.issuedCertificateTokenId)
    @IsInt()
    @Min(0)
    issuedCertificateTokenId?: number;

    @ApiProperty({
        enumName: 'CertificationRequestStatus',
        enum: CertificationRequestStatus,
        required: false
    })
    status?: CertificationRequestStatus;

    @ApiProperty({ type: Boolean, required: false })
    isPrivate?: boolean;
}
