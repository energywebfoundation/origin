import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import {
    Roles,
    RolesGuard,
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
} from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ensureSingleProcessOnly } from '../../utils/ensureSingleProcessOnly';

import { RequestWithdrawalDTO } from './create-withdrawal.dto';
import { WithdrawalBeingProcessedError } from './errors/withdrawal-being-processed.error';
import { Transfer } from './transfer.entity';
import { TransferService } from './transfer.service';

@ApiTags('transfer')
@Controller('transfer')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UsePipes(ValidationPipe)
export class TransferController {
    private readonly logger = new Logger(TransferController.name);

    constructor(private readonly transferService: TransferService) {}

    @Get('all')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({ status: HttpStatus.OK, type: [Transfer], description: 'Get my transfers' })
    public async getMyTransfers(@UserDecorator() { ownerId }: ILoggedInUser): Promise<Transfer[]> {
        return this.transferService.getAll(ownerId);
    }

    @Post('withdrawal')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: RequestWithdrawalDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: String, description: 'Request a withdrawal' })
    public async requestWithdrawal(
        @UserDecorator() user: ILoggedInUser,
        @Body() withdrawal: RequestWithdrawalDTO
    ): Promise<string> {
        try {
            const result = await ensureSingleProcessOnly(
                user.ownerId,
                'requestWithdrawal',
                () => this.transferService.requestWithdrawal(user.ownerId, withdrawal),
                new WithdrawalBeingProcessedError()
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof WithdrawalBeingProcessedError) {
                throw new HttpException({ message: error.message }, 409);
            }

            throw new ForbiddenException();
        }
    }
}
