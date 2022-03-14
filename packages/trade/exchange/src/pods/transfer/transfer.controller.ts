import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    Roles,
    RolesGuard,
    UserDecorator
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
import { IClaimData } from './dto';

import { RequestWithdrawalDTO } from './dto/create-withdrawal.dto';
import { RequestBatchClaimDTO } from './dto/request-batch-claim.dto';
import { RequestClaimDTO } from './dto/request-claim.dto';
import { RequestSendDTO } from './dto/request-send.dto';
import { BeingProcessedError } from './errors/being-processed.error';
import { TransferDirection } from './transfer-direction';
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

    @Get('all/claimed')
    @UseGuards(AuthGuard(), ActiveUserGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [Transfer],
        description: 'Get my claimed transfers'
    })
    public async getMyClaimTransfers(
        @UserDecorator() { ownerId }: ILoggedInUser
    ): Promise<Transfer[]> {
        return this.transferService.getAll(ownerId, TransferDirection.Claim);
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
                new BeingProcessedError(TransferDirection.Withdrawal)
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof BeingProcessedError) {
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
                () =>
                    this.transferService.requestClaim(ownerId, {
                        ...claim,
                        // Conversion to unknown is necessary, because IClaimData is generic interface
                        // with index signature, but ClaimDataDTO is specific to endpoint
                        // and doesn't have index signature
                        claimData: claim.claimData as unknown as IClaimData
                    }),
                new BeingProcessedError(TransferDirection.Claim)
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof BeingProcessedError) {
                throw new ConflictException({ message: error.message });
            }

            throw new ForbiddenException();
        }
    }

    @Post('claim/batch')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: RequestBatchClaimDTO })
    @ApiResponse({ status: HttpStatus.CREATED, type: String, description: 'Request a claim' })
    public async requestBatchClaim(
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() batchClaim: RequestBatchClaimDTO
    ): Promise<string[]> {
        try {
            const result = await ensureSingleProcessOnly(
                ownerId,
                'requestClaim',
                () =>
                    this.transferService.requestBatchClaim(ownerId, {
                        ...batchClaim,
                        // Conversion to unknown is necessary, because IClaimData is generic interface
                        // with index signature, but ClaimDataDTO is specific to endpoint
                        // and doesn't have index signature
                        claimData: batchClaim.claimData as unknown as IClaimData
                    }),
                new BeingProcessedError(TransferDirection.Claim)
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof BeingProcessedError) {
                throw new ConflictException({ message: error.message });
            }

            throw new ForbiddenException();
        }
    }

    @Post('send')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: RequestSendDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: String,
        description: 'Request to send some amount to an address'
    })
    public async requestSend(
        @UserDecorator() { ownerId }: ILoggedInUser,
        @Body() send: RequestSendDTO
    ): Promise<string> {
        try {
            const result = await ensureSingleProcessOnly(
                ownerId,
                'requestSend',
                () => this.transferService.requestSend(ownerId, send),
                new BeingProcessedError(TransferDirection.Send)
            );

            return result;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof BeingProcessedError) {
                throw new ConflictException({ message: error.message });
            }

            throw new ForbiddenException();
        }
    }
}
