import { IClaim } from '@energyweb/issuer';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsPositive,
    IsString,
    Min,
    ValidateIf,
    ValidateNested
} from 'class-validator';
import { EnergyDTO } from './energy.dto';

export class CertificateDTO {
    @ApiProperty({ type: Number })
    @IsInt()
    @Min(0)
    id: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @Min(0)
    tokenId: number;

    @ApiProperty({ type: String })
    @IsString()
    deviceId: string;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    generationStartTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    generationEndTime: number;

    @ApiProperty({ type: Number })
    @IsInt()
    @IsPositive()
    creationTime: number;

    @ApiProperty({ type: EnergyDTO })
    @ValidateNested()
    energy: EnergyDTO;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isOwned: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    isClaimed: boolean;

    @ApiProperty({ required: false })
    @ValidateIf((dto: CertificateDTO) => !!dto.myClaims)
    @IsArray()
    myClaims?: IClaim[];

    @ApiProperty({ required: false })
    @ValidateIf((dto: CertificateDTO) => !!dto.blockchain)
    blockchain?: any;

    @ApiProperty({ type: String, required: false })
    @ValidateIf((dto: CertificateDTO) => !!dto.creationBlockHash)
    creationBlockHash?: string;

    @ApiProperty({ type: Boolean, required: false })
    @ValidateIf((dto: CertificateDTO) => !!dto.issuedPrivately)
    @IsBoolean()
    issuedPrivately?: boolean;
}
