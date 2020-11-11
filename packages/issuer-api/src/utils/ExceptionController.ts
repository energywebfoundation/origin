import { ISuccessResponse } from '@energyweb/origin-backend-core';
import { HttpException } from '@nestjs/common';

export class ExceptionController {
    public throwIfNotSuccess(response: ISuccessResponse): void {
        if (!response.success) {
            throw new HttpException(response.message, response.statusCode);
        }
    }
}
