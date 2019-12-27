import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';

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

            newEntity.address = req.body.address;
            newEntity.businessTypeInput = req.body.businessTypeInput;
            newEntity.businessTypeSelect = req.body.businessTypeSelect;
            newEntity.ceoName = req.body.ceoName;
            newEntity.ceoPassportNumber = req.body.ceoPassportNumber;
            newEntity.code = req.body.code;
            newEntity.companyNumber = req.body.companyNumber;
            newEntity.contact = req.body.contact;
            newEntity.country = req.body.country;
            newEntity.email = req.body.email;
            newEntity.headquartersCountry = req.body.headquartersCountry;
            newEntity.name = req.body.name;
            newEntity.numberOfEmployees = req.body.numberOfEmployees;
            newEntity.postcode = req.body.postcode;
            newEntity.shareholders = req.body.shareholders;
            newEntity.telephone = req.body.telephone;
            newEntity.vatNumber = req.body.vatNumber;
            newEntity.website = req.body.website;
            newEntity.yearOfRegistration = req.body.yearOfRegistration;

            const validationErrors = await validate(newEntity);

            if (validationErrors.length > 0) {
                res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).send({
                    success: false,
                    errors: validationErrors
                });
            } else {
                await repository.save(newEntity);

                res.status(STATUS_CODES.CREATED).send({
                    message: `Entity ${newEntity.id} created`
                });
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
    }
};
