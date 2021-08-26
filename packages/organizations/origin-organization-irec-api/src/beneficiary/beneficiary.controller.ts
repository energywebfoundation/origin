import { ILoggedInUser, Role } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
    AddOrganizationBeneficiaryCommand,
    CreateLocalBeneficiaryCommand,
    GetBeneficiariesCommand,
    RemoveOrganizationBeneficiaryCommand
} from './commands';
import { AddBeneficiaryDto, BeneficiaryDTO, CreateBeneficiaryDto } from './dto';

@ApiTags('irec-beneficiary')
@ApiBearerAuth('access-token')
@UsePipes(ValidationPipe)
@Controller('/irec/beneficiary')
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

    @Get('/company')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [BeneficiaryDTO],
        description: 'Get company beneficiaries'
    })
    public async getCompanyBeneficiaries(
        @UserDecorator() user: ILoggedInUser
    ): Promise<BeneficiaryDTO[]> {
        return this.commandBus.execute(new GetBeneficiariesCommand(user.organizationId));
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin, Role.SupportAgent)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Remove beneficiary from organizations beneficiary list'
    })
    public async removeOrganizationBeneficiary(
        @UserDecorator() user: ILoggedInUser,
        @Param('id') id: string
    ): Promise<void> {
        await this.commandBus.execute(
            new RemoveOrganizationBeneficiaryCommand(Number(id), user.organizationId)
        );
    }

    @Post('/company')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiBody({ type: AddBeneficiaryDto })
    @ApiCreatedResponse({
        type: BeneficiaryDTO,
        description: 'Adds beneficiary to organizations beneficiary list'
    })
    public async addOrganizationBeneficiary(
        @UserDecorator() user: ILoggedInUser,
        @Body() { irecBeneficiaryId }: AddBeneficiaryDto
    ): Promise<BeneficiaryDTO> {
        return this.commandBus.execute(
            new AddOrganizationBeneficiaryCommand(user.organizationId, irecBeneficiaryId)
        );
    }

    @Post()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(
        Role.OrganizationAdmin,
        Role.OrganizationDeviceManager,
        Role.OrganizationUser,
        Role.Admin
    )
    @ApiBody({ type: CreateBeneficiaryDto })
    @ApiCreatedResponse({
        type: BeneficiaryDTO,
        description: 'Creates new beneficiary and adds it to organization beneficiary list'
    })
    public async createBeneficiary(
        @UserDecorator() user: ILoggedInUser,
        @Body() body: CreateBeneficiaryDto
    ): Promise<BeneficiaryDTO> {
        return this.commandBus.execute(
            new CreateLocalBeneficiaryCommand(user.organizationId, body)
        );
    }
}
