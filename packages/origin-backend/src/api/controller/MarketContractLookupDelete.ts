import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { MarketContractLookup } from "../../entity/MarketContractLookup";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function marketContractLookupDeleteAction(req: Request, res: Response) {
    const { address } = req.params;

    console.log(`DELETE - MarketContractLookup ${address}`);

    const marketContractLookupRepository = getRepository(MarketContractLookup);
    const marketContractLookup: MarketContractLookup = await marketContractLookupRepository.findOne(
        address.toLowerCase()
    );

    if (!marketContractLookup) {
        res.status(STATUS_CODES.NOT_FOUND).send({
            error: StorageErrors.NON_EXISTENT_ENTITY
        });

        return;
    }

    await marketContractLookupRepository.remove(marketContractLookup);

    res.status(STATUS_CODES.NO_CONTENT).send({
        message: `MarketContractLookup with address ${address} successfully deleted`
    });
}
