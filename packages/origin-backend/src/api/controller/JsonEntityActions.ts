import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { JsonEntity } from "../../entity/JsonEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export class JsonEntityActions {

    static async get(req: Request, res: Response) {
        let { hash } = req.params;
    
        console.log(`<GET> ${hash}`);
    
        const jsonEntityRepository = getRepository(JsonEntity);
    
        if (hash === undefined || hash === null) {
            const allEntities = await jsonEntityRepository.find();
    
            res.send(allEntities);
    
            return;
        }
        
        const existingEntity = await jsonEntityRepository.findOne({ hash });
    
        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        res.send(JSON.parse(existingEntity.value));
    }
    
    static async post(req: Request, res: Response) {
        let { hash } = req.params;
    
        console.log(`<POST> ${hash}`);
    
        const jsonEntityRepository = getRepository(JsonEntity);
    
        const exists = await jsonEntityRepository.count({ hash }) > 0;
    
        if (exists) {
            res.status(STATUS_CODES.SUCCESS).send({
                message: StorageErrors.ALREADY_EXISTS
            });
    
            return;
        }
    
        const newEntity = new JsonEntity();
    
        newEntity.hash = hash;
        newEntity.value = JSON.stringify(req.body);
    
        await jsonEntityRepository.save(newEntity);
    
        res.status(STATUS_CODES.CREATED).send({
            message: `Entity ${hash} created`
        });
    }
    
    static async delete(req: Request, res: Response) {
        let { hash } = req.params;
    
        console.log(`<DELETE> ${hash}`);
    
        const jsonEntityRepository = getRepository(JsonEntity);
    
        const existingEntity = await jsonEntityRepository.findOne({ hash });
    
        if (!existingEntity) {
            res.status(STATUS_CODES.NOT_FOUND).send({
                error: StorageErrors.NON_EXISTENT
            });
    
            return;
        }
    
        await jsonEntityRepository.remove(existingEntity);
    
        res.status(STATUS_CODES.NO_CONTENT).send({
            message: `Entity ${hash} deleted`
        });
    }
}
