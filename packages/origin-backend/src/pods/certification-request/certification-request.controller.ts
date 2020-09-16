import { ILoggedInUser, Role, ISuccessResponse } from '@energyweb/origin-backend-core';
import { Roles, RolesGuard, UserDecorator, ActiveUserGuard } from '@energyweb/origin-backend-utils';
import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    UseGuards,
    Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StorageErrors } from '../../enums/StorageErrors';
import {
    CertificationRequestQueueItemDTO,
    CertificationRequest,
    CertificationRequestService,
    CertificationRequestQueueItem
} from '.';

@Controller('/CertificationRequest')
export class CertificationRequestController {
    constructor(private readonly certificationRequestService: CertificationRequestService) {}

    @Post()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async queueCertificationRequestData(
        @Body() dto: CertificationRequestQueueItemDTO,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequestQueueItem> {
        return this.certificationRequestService.queue(dto, loggedUser);
    }

    @Get('validate')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager)
    async validateGenerationPeriod(
        @Query('fromTime') fromTime: number,
        @Query('toTime') toTime: number,
        @Query('deviceId') deviceId: string,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<ISuccessResponse> {
        return this.certificationRequestService.validateGenerationPeriod(
            { fromTime, toTime, deviceId },
            loggedUser
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer, Role.Admin)
    async getCertificationRequest(
        @Param('id') id: number,
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest> {
        const request = await this.certificationRequestService.get(id);

        if (!request) {
            throw new NotFoundException(StorageErrors.NON_EXISTENT);
        }

        if (loggedUser.hasRole(Role.Issuer, Role.Admin) || request.userId === loggedUser.ownerId) {
            return request;
        }

        return {
            id: request.id,
            created: request.created,
            energy: request.energy,
            device: request.device
        } as CertificationRequest;
    }

    @Get()
    @UseGuards(AuthGuard(), ActiveUserGuard, RolesGuard)
    @Roles(Role.OrganizationAdmin, Role.OrganizationDeviceManager, Role.Issuer, Role.Admin)
    async getAllCertificationRequests(
        @UserDecorator() loggedUser: ILoggedInUser
    ): Promise<CertificationRequest[]> {
        if (loggedUser.hasRole(Role.Issuer, Role.Admin)) {
            return this.certificationRequestService.getAll();
        }

        return this.certificationRequestService.getAll({
            where: { userId: loggedUser.ownerId }
        });
    }
}
