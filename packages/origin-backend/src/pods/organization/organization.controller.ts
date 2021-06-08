import {
    ensureOrganizationRole,
    ILoggedInUser,
    isRole,
    ResponseFailure,
    ResponseSuccess,
    Role
} from '@energyweb/origin-backend-core';
import {
    ActiveUserGuard,
    NotDeletedUserGuard,
    NullOrUndefinedResultInterceptor,
    Roles,
    RolesGuard,
    StorageErrors,
    SuccessResponseDTO,
    UserDecorator
} from '@energyweb/origin-backend-utils';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpStatus,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UnprocessableEntityException,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { InvitationDTO } from '../invitation/invitation.dto';
import { User } from '../user';
import { BindBlockchainAccountDTO } from './dto/bind-blockchain-account.dto';
import { FullOrganizationInfoDTO } from './dto/full-organization-info.dto';
import { NewOrganizationDTO } from './dto/new-organization.dto';
import { NewDidOrganizationDto } from './dto/new-did-organization.dto';
import { UpdateMemberDTO } from './dto/organization-update-member.dto';
import { OrganizationUpdateDTO } from './dto/organization-update.dto';
import { PublicOrganizationInfoDTO } from './dto/public-organization-info.dto';
import { OrganizationDocumentOwnershipMismatchError } from './errors/organization-document-ownership-mismatch.error';
import { OrganizationNameAlreadyTakenError } from './errors/organization-name-taken.error';
import { OrganizationService } from './organization.service';
import { IAM, setCacheClientOptions, setChainConfig, ENSNamespaceTypes } from 'iam-client-lib';

setCacheClientOptions(73799, {
    url: 'https://volta-identitycache.energyweb.org/' // TODO: get from .env
});

setChainConfig(73799, {
    rpcUrl: 'https://volta-rpc.energyweb.org' // TODO: get from .env
});

const iam = new IAM({
    rpcUrl: 'https://volta-rpc.energyweb.org', // TODO: get from .env
    privateKey:
        process.env.PLATFORM_OPERATOR_PRIVATE_KEY ||
        '9945c05be0b1b7b35b7cec937e78c6552ecedca764b53a772547d94a687db929'
});

const iamConnected = iam.initializeConnection();

@ApiTags('organization')
@ApiBearerAuth('access-token')
@Controller('/Organization')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class OrganizationController {
    private logger = new Logger(OrganizationController.name);

    constructor(private readonly organizationService: OrganizationService) {}

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin, Role.SupportAgent)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [FullOrganizationInfoDTO],
        description: 'Gets all organizations'
    })
    async getAll(): Promise<FullOrganizationInfoDTO[]> {
        const organizations = await this.organizationService.getAll();

        return organizations.map((org) => FullOrganizationInfoDTO.fromPlatformOrganization(org));
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: FullOrganizationInfoDTO,
        description: 'Gets an organization'
    })
    async get(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<FullOrganizationInfoDTO> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return FullOrganizationInfoDTO.fromPlatformOrganization(organization);
    }

    @Get('/:id/public')
    @ApiResponse({
        status: HttpStatus.OK,
        type: PublicOrganizationInfoDTO,
        description: 'Gets a public organization'
    })
    async getPublic(
        @Param('id', new ParseIntPipe()) organizationId: number
    ): Promise<PublicOrganizationInfoDTO> {
        const organization = await this.organizationService.findOne(organizationId);

        return PublicOrganizationInfoDTO.fromPlatformOrganization(organization);
    }

    @Get('/:id/invitations')
    @UseGuards(AuthGuard())
    @ApiResponse({
        status: HttpStatus.OK,
        type: [InvitationDTO],
        description: 'Gets invitations for an organization'
    })
    async getInvitationsForOrganization(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<InvitationDTO[]> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return organization?.invitations?.map((inv) => InvitationDTO.fromInvitation(inv));
    }

    @Get('/:id/users')
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin, Role.SupportAgent)
    @ApiResponse({
        status: HttpStatus.OK,
        type: [User],
        description: 'Gets users of an organization'
    })
    async getUsers(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<User[]> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        const organization = await this.organizationService.findOne(organizationId);

        return organization?.users;
    }

    @Post()
    @UseGuards(AuthGuard())
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: NewOrganizationDTO })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: FullOrganizationInfoDTO,
        description: 'Register an organization'
    })
    async register(
        @Body() organizationToRegister: NewOrganizationDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<FullOrganizationInfoDTO> {
        if (loggedUser.hasOrganization) {
            throw new ForbiddenException('User is already part of an organization');
        }

        try {
            const organization = await this.organizationService.create(
                loggedUser,
                organizationToRegister
            );

            return organization;
        } catch (error) {
            this.logger.error(error.message);

            if (error instanceof OrganizationNameAlreadyTakenError) {
                throw new BadRequestException({ message: error.message });
            }

            if (error instanceof OrganizationDocumentOwnershipMismatchError) {
                throw new ForbiddenException({ message: error.message });
            }

            throw new InternalServerErrorException({
                message: `Unable to register organization due an unknown error`
            });
        }
    }

    @Post('did')
    @UseGuards(AuthGuard())
    @Roles(Role.OrganizationAdmin)
    @ApiBody({ type: NewDidOrganizationDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: FullOrganizationInfoDTO,
        description: 'Register an DID organization'
    })
    async registerDid(
        @Body() organizationToRegister: NewDidOrganizationDto,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<any> {
        const namespace = organizationToRegister.ensNamespace;

        this.logger.debug(
            `adding DID organization: namespace=${organizationToRegister.ensNamespace}`
        );

        await iamConnected; // TODO: review if there are any good practices to handle connection states correctly

        const userChainRoles = (await iam.getUserClaims({ did: loggedUser.did }))
            .filter((claim) => !!claim.claimType) // role claims have claimType property
            .map((claim) => claim.claimType) // claimType property contains role namespace
            .filter((claimType) => {
                const arr = claimType.split('.');
                return arr.length > 1 && arr[1] === ENSNamespaceTypes.Roles;
            });

        this.logger.debug(`chain roles: ${JSON.stringify(userChainRoles)}`);

        const requiredRole = `organizationadmin.${ENSNamespaceTypes.Roles}.${organizationToRegister.ensNamespace}`;

        this.logger.debug(`required role: ${requiredRole}`);

        if (userChainRoles.indexOf(requiredRole) < 0) {
            throw new ForbiddenException(`User does not have ${requiredRole} role`);
        }

        const organization = await iam.getOrgHierarchy({ namespace });

        this.logger.debug(`org. hierarchy: ${JSON.stringify(organization, null, 4)}`);

        return { status: 'OK' };
    }

    @Delete('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Delete an organization'
    })
    async delete(
        @Param('id', new ParseIntPipe()) organizationId: number
    ): Promise<SuccessResponseDTO> {
        const organization = await this.organizationService.findOne(organizationId);

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        await this.organizationService.remove(organizationId);

        return ResponseSuccess();
    }

    @Put('/:id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.Admin)
    @ApiBody({ type: OrganizationUpdateDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Update an organization'
    })
    async update(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Body() body: OrganizationUpdateDTO
    ): Promise<SuccessResponseDTO> {
        const organization = await this.organizationService.findOne(organizationId);

        if (!organization) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        if (organization.status === body.status) {
            throw new BadRequestException(`Organization is already in requested status.`);
        }

        try {
            await this.organizationService.update(organizationId, body.status);
        } catch (error) {
            this.logger.error(error);
            throw new UnprocessableEntityException(
                ResponseFailure(
                    `Entity ${organizationId} could not be updated due to an unknown error`
                )
            );
        }

        return ResponseSuccess();
    }

    @Put(':id/remove-member/:memberId')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Removes a member from an organization'
    })
    async removeMember(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('memberId', new ParseIntPipe()) memberId: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        await this.organizationService.removeMember(loggedUser.organizationId, memberId);

        return ResponseSuccess();
    }

    @Put(':id/change-role/:userId')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.Admin)
    @ApiBody({ type: UpdateMemberDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: 'Removes a member from an organization'
    })
    async changeMemberRole(
        @Param('id', new ParseIntPipe()) organizationId: number,
        @Param('userId', new ParseIntPipe()) memberId: number,
        @Body() { role }: UpdateMemberDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<SuccessResponseDTO> {
        this.ensureOrganizationMemberOrAdmin(loggedUser, organizationId);

        try {
            ensureOrganizationRole(role);
        } catch (e) {
            throw new ForbiddenException();
        }

        await this.organizationService.changeMemberRole(loggedUser.organizationId, memberId, role);

        return ResponseSuccess();
    }

    @Post('chain-address')
    @UseGuards(AuthGuard('jwt'), NotDeletedUserGuard)
    @ApiBody({ type: BindBlockchainAccountDTO })
    @ApiResponse({
        status: HttpStatus.OK,
        type: SuccessResponseDTO,
        description: `Set the organization blockchain address`
    })
    public async setBlockchainAddress(
        @UserDecorator() { organizationId }: ILoggedInUser,
        @Body() { signedMessage }: BindBlockchainAccountDTO
    ): Promise<SuccessResponseDTO> {
        if (!organizationId) {
            throw new NotFoundException('User is not a part of an organization.');
        }

        return this.organizationService.setBlockchainAddress(organizationId, signedMessage);
    }

    private ensureOrganizationMemberOrAdmin(user: ILoggedInUser, organizationId: number) {
        const isOrganizationMember = user.organizationId === organizationId;
        const hasAdminRole = isRole(user, Role.Admin, Role.SupportAgent);

        if (hasAdminRole) {
            return;
        }
        if (!isOrganizationMember) {
            throw new ForbiddenException('Not a member of the organization.');
        }
    }
}
