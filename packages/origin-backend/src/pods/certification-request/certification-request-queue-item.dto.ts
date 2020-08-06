import { Validate, IsOptional, IsInt, IsPositive } from 'class-validator';
import { PositiveBNStringValidator } from '../../utils/positiveBNStringValidator';

export class CertificationRequestQueueItemDTO {
    public readonly deviceId: string;

    @IsInt()
    @IsPositive()
    public readonly fromTime: number;

    @IsInt()
    @IsPositive()
    public readonly toTime: number;

    @Validate(PositiveBNStringValidator)
    public readonly energy: string;

    @IsOptional()
    public readonly files: string[];
}
