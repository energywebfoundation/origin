import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiQuery,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';

import { BeneficiaryDTO } from './dto/beneficiary.dto';
import {
    AddOrganizationBeneficiaryCommand,
    GetBeneficiariesCommand,
    RemoveOrganizationBeneficiaryCommand
} from './commands';
import { CreateBeneficiaryDTO } from './dto/create-beneficiary.dto';

@ApiTags('irec_beneficiary')
@ApiBearerAuth('access-token')
@UsePipes(ValidationPipe)
@Controller('irec/beneficiary')
export class BeneficiaryController {
    constructor(private readonly commandBus: CommandBus) {}

    @Get()
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [BeneficiaryDTO],
        description: 'Get all platform beneficiaries'
    })
    public async getPlatformBeneficiaries(
        @UserDecorator() user: ILoggedInUser
    ): Promise<BeneficiaryDTO[]> {
        return this.commandBus.execute(new GetBeneficiariesCommand());
    }

    @Get()
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [BeneficiaryDTO],
        description: 'Get company platform beneficiaries'
    })
    public async removeOrganizationBeneficiary(
        @UserDecorator() user: ILoggedInUser
    ): Promise<BeneficiaryDTO[]> {
        return this.commandBus.execute(new GetBeneficiariesCommand(user.organizationId));
    }

    @Delete()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin, Role.SupportAgent)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Remove beneficiary from organizations beneficiary list'
    })
    @ApiQuery({
        name: 'beneficiaryId',
        description: 'Beneficiary id to delete',
        required: true,
        type: Number
    })
    public async getCompanyBeneficiaries(
        @UserDecorator() user: ILoggedInUser,
        @Query('beneficiaryId') beneficiaryId: number
    ): Promise<void> {
        await this.commandBus.execute(
            new RemoveOrganizationBeneficiaryCommand(beneficiaryId, user.organizationId)
        );
    }

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: CreateBeneficiaryDTO })
    @ApiCreatedResponse({
        type: BeneficiaryDTO,
        description: 'Adds beneficiary to organizations beneficiary list'
    })
    public async register(
        @UserDecorator() user: ILoggedInUser,
        @Body() { ownerOrganizationId, irecBeneficiaryId }: CreateBeneficiaryDTO
    ): Promise<BeneficiaryDTO> {
        return this.commandBus.execute(
            new AddOrganizationBeneficiaryCommand(ownerOrganizationId, irecBeneficiaryId)
        );
    }
}
