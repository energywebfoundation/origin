import {
    EmailConfirmationResponse,
    IEmailConfirmationToken,
    ISuccessResponse,
    IUser
} from '@energyweb/origin-backend-core';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import moment from 'moment';
import { Repository } from 'typeorm';

import { User } from '../user/user.entity';
import { EmailConfirmation } from './email-confirmation.entity';
import { EmailConfirmationRequestedEvent } from './events';

@Injectable()
export class EmailConfirmationService {
    constructor(
        @InjectRepository(EmailConfirmation)
        private readonly repository: Repository<EmailConfirmation>,
        private readonly eventBus: EventBus
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

        this.eventBus.publish(new EmailConfirmationRequestedEvent(email.toLowerCase(), token));

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
