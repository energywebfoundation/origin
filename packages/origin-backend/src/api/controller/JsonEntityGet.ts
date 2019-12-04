import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { JsonEntity } from "../../entity/JsonEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function jsonEntityGetAction(req: Request, res: Response) {
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
            error: StorageErrors.NON_EXISTENT_ENTITY
        });

        return;
    }

    res.send(JSON.parse(existingEntity.value));
}
