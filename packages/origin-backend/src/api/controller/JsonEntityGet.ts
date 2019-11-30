import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { JsonEntity } from "../../entity/JsonEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function jsonEntityGetAction(req: Request, res: Response) {
    let { contractAddress, type, identifier, hash } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> GET - ${type} ${identifier} ${hash}`);

    const jsonEntityRepository = getRepository(JsonEntity);

    if (identifier === undefined || identifier === null) {
        const entities = await jsonEntityRepository.find({
            contractAddress,
            type
        });

        res.send(entities);

        return;
    }

    if (hash === undefined || hash === null) {
        const entities = await jsonEntityRepository.find({
            contractAddress,
            type,
            identifier
        });

        res.send(entities);

        return;
    }
    
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

    res.send(JSON.parse(existingEntity.value));
}
