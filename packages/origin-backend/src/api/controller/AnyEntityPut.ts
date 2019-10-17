import { Request, Response } from "express";
import { getRepository, Repository } from "typeorm";

import { AnyEntity } from "../../entity/AnyEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function anyEntityPutAction(req: Request, res: Response) {let { contractAddress, type, identifier } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> PUT - ${type} ${identifier}`);

    const anyEntityRepository: Repository<AnyEntity> = getRepository(AnyEntity);

    const existingEntity: AnyEntity = await anyEntityRepository.findOne({
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

    existingEntity.value = JSON.stringify(req.body);

    await anyEntityRepository.save(existingEntity);

    res.status(STATUS_CODES.SUCCESS).send({
        message: `Resource ${type} with ID ${identifier} updated`
    });
}
