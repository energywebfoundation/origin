import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { JsonEntity } from "../../entity/JsonEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function jsonEntityDeleteAction(req: Request, res: Response) {
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
