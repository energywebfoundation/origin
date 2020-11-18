import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    UserDecorator,
    ActiveUserGuard,
    NullOrUndefinedResultInterceptor
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
    HttpCode,
    Post,
    Logger,
    InternalServerErrorException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AccountService } from './account.service';
import { AccountDTO } from './account.dto';
import { AccountAlreadyExistsError } from './account-already-exists.error';

@Controller('account')
@UseInterceptors(NullOrUndefinedResultInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(ValidationPipe)
export class AccountController {
    private readonly logger = new Logger(AccountService.name);

    constructor(private readonly accountService: AccountService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard)
    public async getAccount(@UserDecorator() user: ILoggedInUser): Promise<AccountDTO> {
        const account = await this.accountService.getAccount(user.ownerId);

        if (!account) {
            throw new BadRequestException({ message: 'Your account was not yet created' });
        }

        return account;
    }

    @Post()
    @HttpCode(202)
    public async create(@UserDecorator() user: ILoggedInUser): Promise<void> {
        try {
            await this.accountService.create(user.ownerId);
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
