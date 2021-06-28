import { ApiProperty } from '@nestjs/swagger';

export class CreateBeneficiaryDTO {
    @ApiProperty({ type: Number })
    irecBeneficiaryId: number;
}
