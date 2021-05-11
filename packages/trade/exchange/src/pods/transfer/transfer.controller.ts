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
    ConflictException,
    Controller,
    ForbiddenException,
    Get,
    HttpStatus,
    Logger,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ensureSingleProcessOnly } from '../../utils/ensureSingleProcessOnly';

import { RequestWithdrawalDTO } from './dto/create-withdrawal.dto';
import { RequestBulkClaimDTO } from './dto/request-bulk-claim.dto';
import { RequestClaimDTO } from './dto/request-claim.dto';
import { ClaimBeingProcessedError } from './errors/claim-being-processed.error';
import { WithdrawalBeingProcessedError } from './errors/withdrawal-being-processed.error';
import { Transfer } from './transfer.entity';
import { TransferService } from './transfer.service';

@ApiTags('transfer')
@ApiBearerAuth('access-token')
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
                throw new ConflictException({ message: error.message });
            }

            throw new ForbiddenException();
        }
    }

    @Post('claim')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: RequestClaimDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: String, description: 'Request a claim' })
    public async requestClaim(
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() claim: RequestClaimDTO
    ): Promise<string> {
        try {
            const result = await ensureSingleProcessOnly(
                ownerId,
                'requestClaim',
                () => this.transferService.requestClaim(ownerId, claim),
                new ClaimBeingProcessedError()
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof ClaimBeingProcessedError) {
                throw new ConflictException({ message: error.message });
            }

            throw new ForbiddenException();
        }
    }

    @Post('claim/bulk')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: RequestBulkClaimDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: String, description: 'Request a claim' })
    public async requestBulkClaim(
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() bulkClaim: RequestBulkClaimDTO
    ): Promise<string> {
        try {
            const result = await ensureSingleProcessOnly(
                ownerId,
                'requestClaim',
                () => this.transferService.requestBulkClaim(ownerId, bulkClaim),
                new ClaimBeingProcessedError()
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof ClaimBeingProcessedError) {
                throw new ConflictException({ message: error.message });
            }

            throw new ForbiddenException();
        }
    }
}
