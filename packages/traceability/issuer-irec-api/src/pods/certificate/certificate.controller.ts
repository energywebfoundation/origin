import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    Controller,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';

import {
    ExceptionInterceptor,
} from '@energyweb/origin-backend-utils';
import { CertificateController } from '@energyweb/issuer-api';

@ApiTags('irec-certificates')
@ApiBearerAuth('access-token')
@Controller('/irec/certificate')
@UseInterceptors(ExceptionInterceptor)
@UsePipes(ValidationPipe)
export class IrecCertificateController extends CertificateController {
}
