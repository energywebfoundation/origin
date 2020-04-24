import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('users')
    @UseGuards(AuthGuard('jwt'))
    public async getAllUser() {
        return this.adminService.getAllUser();
    }
}
