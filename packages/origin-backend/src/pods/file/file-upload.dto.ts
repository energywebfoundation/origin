import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
    @ApiProperty({ type: 'blob', format: 'binary', isArray: true })
    files: any;
}
