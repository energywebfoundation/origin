import {
    ILoggedInUser,
    IOwnershipCommitmentProofWithTx,
    Role
} from '@energyweb/origin-backend-core';
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
    Get,
    NotFoundException,
    Param,
    UseGuards,
    Put,
    UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StorageErrors } from '../../enums/StorageErrors';
import { CertificateService } from './certificate.service';

@Controller('/Certificate')
@UseInterceptors(NullOrUndefinedResultInterceptor)
export class CertificateController {
    constructor(private readonly certificateService: CertificateService) {}

    // TODO: add ownership management and roles

    @Get(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationUser)
    async getOwnershipCommitment(
        @Param('id') id: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = await this.certificateService.get(id);

        if (!certificate?.currentOwnershipCommitment) {
            throw new NotFoundException(`getOwnershipCommitment(): ${StorageErrors.NON_EXISTENT}`);
        }

        return certificate.currentOwnershipCommitment;
    }

    @Put(`/:id/OwnershipCommitment`)
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationUser)
    async addOwnershipCommitment(
        @Param('id') id: number,
        @Body() proof: IOwnershipCommitmentProofWithTx,
        @UserDecorator() loggedUser: ILoggedInUser
    ) {
        return this.certificateService.addOwnershipCommitment(id, proof, loggedUser);
    }
}
