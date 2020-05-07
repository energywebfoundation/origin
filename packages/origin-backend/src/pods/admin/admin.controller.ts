import { IUser, SupportedEvents, UserStatusChangedEvent } from '@energyweb/origin-backend-core';
import { Body, Controller, Get, Param, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from '../notification/notification.service';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly adminService: AdminService
    ) {}

    @Get('users')
    @UseGuards(AuthGuard('jwt'))
    public async getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Get('usersBy')
    @UseGuards(AuthGuard('jwt'))
    public async getUsersBy(
        @Query('orgName') orgName: string,
        @Query('status') status: number,
        @Query('kycStatus') kycStatus: number
    ) {
        return this.adminService.getUsersBy(orgName, status, kycStatus);
    }

    @Put('users/:id')
    @UseGuards(AuthGuard('jwt'))
    public async put(@Param('id') id: string, @Body() body: IUser) {
        const user = await this.adminService.update(id, body);
        const eventData: UserStatusChangedEvent = {
            email: user.email
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.USER_STATUS_CHANGED,
            data: eventData
        });

        return user;
    }
}
