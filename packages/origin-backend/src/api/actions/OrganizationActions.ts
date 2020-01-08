import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';
import {
    OrganizationStatus,
    OrganizationPostData,
    IOrganization
} from '@energyweb/origin-backend-core';

import { Organization } from '../../entity/Organization';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';
import { IActions } from './IActions';

export const OrganizationActions: IActions = {
    get: async (req: Request, res: Response) => {
        const { id } = req.params;

        console.log(`<GET> Organization/${id}`);

        const repository = getRepository(Organization);

        if (typeof id === 'undefined' || id === null) {
            const allEntities = await repository.find();

            res.send(allEntities);

            return;
        }

        const existingEntity = await repository.findOne(id);

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });

            return;
        }

        res.send(existingEntity);
    },
    post: async (req: Request, res: Response) => {
        console.log(`<POST> Organization`);

        try {
            const repository = getRepository(Organization);

            const newEntity = new Organization();

            const data: Omit<IOrganization, 'id'> = {
                ...(req.body as OrganizationPostData),
                status: OrganizationStatus.Submitted
            };

            Object.assign(newEntity, data);

            const validationErrors = await validate(newEntity);

            if (validationErrors.length > 0) {
                res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).send({
                    success: false,
                    errors: validationErrors
                });
            } else {
                await repository.save(newEntity);

                res.status(STATUS_CODES.CREATED).send(newEntity);
            }
        } catch (error) {
            console.warn('Error while saving entity', error);
            res.status(STATUS_CODES.BAD_REQUEST).send('Could not save organization.');
        }
    },
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        console.log(`<DELETE> Organization/${id}`);
        const repository = getRepository(Organization);
        const existingEntity = await repository.findOne(id);

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
            return;
        }
        await repository.remove(existingEntity);
        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `Entity ${id} deleted`
        });
    },
    async put(req: Request, res: Response) {
        const { id } = req.params;
        console.log(`<PUT> Organization/${id}`);

        const repository = getRepository(Organization);
        const existingEntity = await repository.findOne(id);

        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
            return;
        }

        existingEntity.status = req.body.status;

        try {
            await existingEntity.save();

            res.status(STATUS_CODES.SUCCESS).send({
                message: `Entity ${id} successfully updated`
            });
        } catch (error) {
            res.send(STATUS_CODES.UNPROCESSABLE_ENTITY).send({
                message: `Entity ${id} could not be updated due to an unkown error`
            });
        }
    }
};
