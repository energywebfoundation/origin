import { IsOptional } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class FileIds {
    @IsOptional()
    @Expose({ name: 'file_data', toPlainOnly: true })
    @Transform((ids: string[]) => ids?.map((id) => ({ file_uid: id })) ?? [], { toPlainOnly: true })
    @Transform((ids: any[]) => ids.map((val: any) => val?.file_uid ?? val), { toClassOnly: true })
    files?: string[];
}
