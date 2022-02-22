import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IrecRequestClaimBeneficiaryDTO {
  @ApiProperty({ type: Number })
  irecId: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  countryCode: string;

  @ApiProperty({ type: String })
  location: string;
}

export class IrecRequestClaimDTO {
  @ApiProperty({ type: String })
  amount: string;

  @ApiPropertyOptional({
      type: String,
      description: 'Blockchain address to claim to',
      example: '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8'
  })
  claimAddress?: string;

  @ApiProperty({ type: IrecRequestClaimBeneficiaryDTO })
  beneficiary: IrecRequestClaimBeneficiaryDTO;

  @ApiProperty({ type: String })
  assetId: string;

  @ApiProperty({ type: String })
  periodStartDate: string;

  @ApiProperty({ type: String })
  periodEndDate: string;

  @ApiProperty({ type: String })
  purpose: string;
}