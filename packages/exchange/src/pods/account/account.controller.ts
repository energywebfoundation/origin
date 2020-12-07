import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    ActiveOrganizationGuard,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    ClassSerializerInterceptor,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Logger,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConflictResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccountAlreadyExistsError } from './account-already-exists.error';
import { AccountDTO } from './account.dto';
import { AccountService } from './account.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class AccountController {
    private readonly logger = new Logger(AccountService.name);

    constructor(private readonly accountService: AccountService) {}

    @Get()
    @UseGuards(AuthGuard())
    @ApiResponse({ status: HttpStatus.OK, type: AccountDTO, description: 'Get the Account' })
    public async getAccount(@UserDecorator() { ownerId }: ILoggedInUser): Promise<AccountDTO> {
        const account = await this.accountService.getAccount(ownerId);

        const response = account || { address: '' };

        return response;
    }

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(AuthGuard(), ActiveUserGuard, ActiveOrganizationGuard)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Created the Exchange Account' })
    @ApiConflictResponse({ description: 'Account already exists' })
    public async create(@UserDecorator() { ownerId }: ILoggedInUser): Promise<boolean> {
        try {
            await this.accountService.create(ownerId);
            return true;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof AccountAlreadyExistsError) {
                throw new ConflictException({ message: error.message });
            }

            throw new InternalServerErrorException({
                message: `Unable to create an account due an unknown error`
            });
        }
    }
}
