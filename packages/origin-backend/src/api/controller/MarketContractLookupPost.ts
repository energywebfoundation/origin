import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { MarketContractLookup } from "../../entity/MarketContractLookup";
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

export async function marketContractLookupPostAction(req: Request, res: Response) {
    let { address } = req.params;
    address = address.toLowerCase();

    console.log(`POST - MarketContractLookup: ${address}`);

    const marketContractLookupRepository = getRepository(MarketContractLookup);
    const marketContracts: MarketContractLookup[] = await marketContractLookupRepository.find();
    const marketAddresses: string[] = marketContracts.map(contract => contract.address);

    if (marketAddresses.includes(address)) {
        res.status(STATUS_CODES.CONFLICT).send({
            error: StorageErrors.ALREADY_EXISTS
        });

        return;
    }

    const newMarketContractLookup = new MarketContractLookup();
    newMarketContractLookup.address = address.toLowerCase();

    await marketContractLookupRepository.save(newMarketContractLookup);

    res.status(STATUS_CODES.CREATED).send({
        message: `MarketContractLookup ${address} created`
    });
}
