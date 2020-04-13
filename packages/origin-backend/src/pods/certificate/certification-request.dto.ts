import { IsInt, IsPositive, Validate, IsOptional } from 'class-validator';
import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class CertificationRequestDTO {
    @IsInt()
    @IsPositive()
    public readonly id: number;

    @Validate(PositiveBNStringValidator)
    public readonly energy: string;

    @IsOptional()
    public readonly files: string[];
}
