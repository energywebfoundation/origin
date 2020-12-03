import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor,
    ActiveOrganizationGuard
} from '@energyweb/origin-backend-utils';
import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
    ValidationPipe,
    UsePipes,
    BadRequestException,
    Post,
    Logger,
    InternalServerErrorException,
    HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';
import { AccountAlreadyExistsError } from './account-already-exists.error';

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
    @UseGuards(AuthGuard(), ActiveUserGuard, ActiveOrganizationGuard)
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Created the Exchange Account' })
    public async create(@UserDecorator() { ownerId }: ILoggedInUser): Promise<boolean> {
        try {
            await this.accountService.create(ownerId);
            return true;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof AccountAlreadyExistsError) {
                throw new BadRequestException({ message: error.message });
            }

            throw new InternalServerErrorException({
                message: `Unable to create an account due an unknown error`
            });
        }
    }
}
