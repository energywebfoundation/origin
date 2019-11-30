import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { JsonEntity } from "../../entity/JsonEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function jsonEntityPutAction(req: Request, res: Response) {
    let { contractAddress, type, identifier, hash } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> PUT - ${type} ${identifier} ${hash}`);

    const jsonEntityRepository = getRepository(JsonEntity);

    const existingEntity = await jsonEntityRepository.findOne({
        contractAddress,
        type,
        identifier,
        hash
    });

    if (!existingEntity) {
        res.status(STATUS_CODES.NOT_FOUND).send({
            error: StorageErrors.NON_EXISTENT_ENTITY
        });

        return;
    }

    existingEntity.value = JSON.stringify(req.body);

    await jsonEntityRepository.save(existingEntity);

    res.status(STATUS_CODES.SUCCESS).send({
        message: `Resource ${type} with ID ${identifier} and hash ${hash} updated`
    });
}
