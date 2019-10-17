import { Request, Response } from "express";
import { getRepository, Repository } from "typeorm";

import { AnyEntity } from "../../entity/AnyEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function anyEntityGetAction(req: Request, res: Response) {
    let { contractAddress, type, identifier } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> GET - ${type} ${identifier}`);

    const anyEntityRepository: Repository<AnyEntity> = getRepository(AnyEntity);

    if (identifier === undefined || identifier === null) {
        const entities: AnyEntity[] = await anyEntityRepository.find({
            contractAddress,
            type
        });

        res.send(entities);

        return;
    }
    
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

    res.send(JSON.parse(existingEntity.value));
}
