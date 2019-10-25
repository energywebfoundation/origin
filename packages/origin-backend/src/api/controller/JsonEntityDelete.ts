import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { JsonEntity } from "../../entity/JsonEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function jsonEntityDeleteAction(req: Request, res: Response) {
    let { contractAddress, type, identifier } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> DELETE - ${type} ${identifier}`);

    const jsonEntityRepository = getRepository(JsonEntity);

    const existingEntity = await jsonEntityRepository.findOne({
        contractAddress,
        type,
        identifier
    });

    if (!existingEntity) {
        res.status(STATUS_CODES.NOT_FOUND).send({
            error: StorageErrors.NON_EXISTENT_ENTITY
        });

        return;
    }

    await jsonEntityRepository.remove(existingEntity);

    res.status(STATUS_CODES.NO_CONTENT).send({
        message: `${type} with ID ${identifier} successfully deleted`
    });
}
