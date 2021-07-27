import { ApiProperty } from '@nestjs/swagger';

export class AddBeneficiaryDto {
    @ApiProperty({ type: Number })
    irecBeneficiaryId: number;
}
