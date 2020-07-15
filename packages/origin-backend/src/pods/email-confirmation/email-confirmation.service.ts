import crypto from 'crypto';
import { Logger, Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    IEmailConfirmationToken,
    IUser,
    ISuccessResponse,
    ConfirmEmailEvent,
    SupportedEvents,
    EmailConfirmationResponse
} from '@energyweb/origin-backend-core';
import moment from 'moment';
import { EmailConfirmation } from './email-confirmation.entity';
import { User } from '../user/user.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class EmailConfirmationService {
    private readonly logger = new Logger(EmailConfirmationService.name);

    constructor(
        @InjectRepository(EmailConfirmation)
        private readonly repository: Repository<EmailConfirmation>,
        private readonly notificationService: NotificationService
    ) {}

    public async create(user: User): Promise<EmailConfirmation> {
        const exists = await this.repository.findOne({ user: { email: user.email } });

        if (exists) {
            throw new ConflictException({
                success: false,
                message: `Email confirmation for user with email ${user.email} already exists`
            });
        }

        const { token, expiryTimestamp } = this.generateEmailToken();

        const emailConfirmation = await this.repository.save({
            user,
            confirmed: false,
            token,
            expiryTimestamp
        });

        await this.sendConfirmationEmail(user.email);

        return emailConfirmation;
    }

    async get(userId: IUser['id']): Promise<EmailConfirmation> {
        const all = await this.repository.find({ relations: ['user'] });

        return all.find((confirmation) => confirmation.user.id === userId);
    }

    async getByEmail(email: IUser['email']): Promise<EmailConfirmation> {
        const all = await this.repository.find({ relations: ['user'] });

        return all.find(
            (confirmation) => confirmation.user.email.toLowerCase() === email.toLowerCase()
        );
    }

    async confirmEmail(
        token: IEmailConfirmationToken['token']
    ): Promise<EmailConfirmationResponse> {
        const emailConfirmation = await this.repository.findOne({ token });

        if (!emailConfirmation) {
            throw new BadRequestException({
                success: false,
                message: `Email confirmation doesn't exist`
            });
        }

        if (emailConfirmation.confirmed === true) {
            return EmailConfirmationResponse.AlreadyConfirmed;
        }

        if (emailConfirmation.expiryTimestamp < moment().unix()) {
            return EmailConfirmationResponse.Expired;
        }

        await this.repository.update(emailConfirmation.id, {
            confirmed: true
        });

        return EmailConfirmationResponse.Success;
    }

    public async sendConfirmationEmail(email: IUser['email']): Promise<ISuccessResponse> {
        const currentToken = await this.getByEmail(email);

        let { token, expiryTimestamp } = currentToken;
        const { id, confirmed } = currentToken;

        if (confirmed === true) {
            throw new BadRequestException({
                success: false,
                message: `Email already confirmed`
            });
        }

        if (expiryTimestamp < moment().unix()) {
            const newToken = this.generateEmailToken();
            await this.repository.update(id, newToken);

            ({ token, expiryTimestamp } = newToken);
        }

        const eventData: ConfirmEmailEvent = {
            email: email.toLowerCase(),
            token
        };

        this.notificationService.handleEvent({
            type: SupportedEvents.CONFIRM_EMAIL,
            data: eventData
        });

        return {
            success: true
        };
    }

    generateEmailToken(): IEmailConfirmationToken {
        return {
            token: crypto.randomBytes(64).toString('hex'),
            expiryTimestamp: moment().add(8, 'hour').unix()
        };
    }
}
