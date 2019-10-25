import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { MarketContractLookup } from "../../entity/MarketContractLookup";

export async function marketContractLookupGetAction(req: Request, res: Response) {
    console.log(`GET - MarketContractLookup`);
    const marketContractLookupRepository = getRepository(MarketContractLookup);

    const contracts: MarketContractLookup[] = await marketContractLookupRepository.find();

    res.send(
        contracts.map(contract => contract.address)
    );
}
