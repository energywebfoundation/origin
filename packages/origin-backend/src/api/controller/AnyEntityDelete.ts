import { Request, Response } from "express";
import { getRepository, Repository } from "typeorm";

import { EntityType } from "../../entity/EntityType";
import { AnyEntity } from "../../entity/AnyEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';
import { getOrCreateEntityType } from '../utils';

export async function anyEntityDeleteAction(req: Request, res: Response) {
    let { contractAddress, type, identifier } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> DELETE - ${type} ${identifier}`);

    const entityType: EntityType = await getOrCreateEntityType(type);
    const anyEntityRepository: Repository<AnyEntity> = getRepository(AnyEntity);

    let existingEntity: AnyEntity;
    
    existingEntity = await anyEntityRepository.findOne({
        contractAddress,
        type: entityType,
        identifier
    });

    if (!existingEntity) {
        res.status(STATUS_CODES.NOT_FOUND).send({
            error: StorageErrors.NON_EXISTENT_ENTITY
        });

        return;
    }

    await anyEntityRepository.remove(existingEntity);

    res.status(STATUS_CODES.NO_CONTENT).send({
        message: `${type} with ID ${identifier} successfully deleted`
    });
}
