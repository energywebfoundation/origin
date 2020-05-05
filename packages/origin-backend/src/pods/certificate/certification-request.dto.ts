import { Validate, IsOptional } from 'class-validator';
import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class CertificationRequestUpdateDTO {
    @Validate(PositiveBNStringValidator)
    public readonly energy: string;

    @IsOptional()
    public readonly files: string[];
}
