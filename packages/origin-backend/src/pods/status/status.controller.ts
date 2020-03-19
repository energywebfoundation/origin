import { Controller, Get } from '@nestjs/common';

@Controller('status')
export class StatusController {
    @Get()
    async get() {
        return { status: 'OK'};
    }
}
