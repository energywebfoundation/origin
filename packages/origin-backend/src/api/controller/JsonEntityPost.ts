import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { JsonEntity } from '../../entity/JsonEntity';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function jsonEntityPostAction(req: Request, res: Response) {
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
