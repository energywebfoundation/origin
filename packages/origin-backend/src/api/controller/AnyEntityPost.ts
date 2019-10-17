import { Request, Response } from "express";
import { getRepository, Repository } from "typeorm";

import { AnyEntity } from "../../entity/AnyEntity";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function anyEntityPostAction(req: Request, res: Response) {
    let { contractAddress, type, identifier } = req.params;
    contractAddress = contractAddress.toLowerCase();

    console.log(`<${contractAddress}> POST - ${type} ${identifier}`);

    const anyEntityRepository: Repository<AnyEntity> = getRepository(AnyEntity);

    try {
        const newEntity: AnyEntity = new AnyEntity();

        newEntity.contractAddress = contractAddress;
        newEntity.identifier = identifier;
        newEntity.type = type;
        newEntity.value = JSON.stringify(req.body);

        await anyEntityRepository.save(newEntity);
    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
            res.status(STATUS_CODES.CONFLICT).send({
                error: StorageErrors.ALREADY_EXISTS
            });

            return;
        }

        throw e;
    }

    res.status(STATUS_CODES.CREATED).send({
        message: `Resource ${type} with ID ${identifier} created`
    });
}
